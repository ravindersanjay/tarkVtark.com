package com.debatearena.integration;

import com.debatearena.service.S3FileStorageService;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.testcontainers.containers.localstack.LocalStackContainer;
import org.testcontainers.utility.DockerImageName;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.lang.reflect.Field;
import java.net.URI;

public class S3FileStorageServiceIT {

    static LocalStackContainer localstack;
    static S3Client s3Client;

    @BeforeAll
    public static void setup() {
        localstack = new LocalStackContainer(DockerImageName.parse("localstack/localstack:0.14.3"))
                .withServices(LocalStackContainer.Service.S3);
        localstack.start();

        URI endpoint = localstack.getEndpointOverride(LocalStackContainer.Service.S3);

        AwsBasicCredentials creds = AwsBasicCredentials.create(localstack.getAccessKey(), localstack.getSecretKey());

        s3Client = S3Client.builder()
                .endpointOverride(endpoint)
                .region(Region.of(localstack.getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(creds))
                .build();
    }

    @AfterAll
    public static void tearDown() {
        if (s3Client != null) s3Client.close();
        if (localstack != null) localstack.stop();
    }

    @Test
    public void testUploadAndDeleteUsingS3Service() throws Exception {
        String bucket = "test-bucket";
        s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());

        // Instantiate service using LocalStack credentials (constructor expects accessKey, secret, region)
        S3FileStorageService svc = new S3FileStorageService(localstack.getAccessKey(), localstack.getSecretKey(), localstack.getRegion());

        // Reflectively set the private bucketName and baseUrl fields that are normally @Value-injected
        Field bucketField = S3FileStorageService.class.getDeclaredField("bucketName");
        bucketField.setAccessible(true);
        bucketField.set(svc, bucket);

        Field baseUrlField = S3FileStorageService.class.getDeclaredField("baseUrl");
        baseUrlField.setAccessible(true);
        baseUrlField.set(svc, localstack.getEndpointOverride(LocalStackContainer.Service.S3).toString());

        // Also set the internal s3Client to our test client via reflection
        Field clientField = S3FileStorageService.class.getDeclaredField("s3Client");
        clientField.setAccessible(true);
        clientField.set(svc, s3Client);

        // Create a mock file and upload
        MockMultipartFile mock = new MockMultipartFile("file", "hello.txt", "text/plain", "Hello Test".getBytes());
        String fileUrl = svc.uploadFile(mock, "attachments");
        Assertions.assertNotNull(fileUrl);

        // Verify the object exists in S3
        // Extract key from returned URL (S3FileStorageService returns baseUrl/bucket/key)
        String key = fileUrl.substring(fileUrl.indexOf(bucket + "/") + (bucket.length() + 1));
        HeadObjectResponse head = s3Client.headObject(HeadObjectRequest.builder().bucket(bucket).key(key).build());
        Assertions.assertNotNull(head);

        // Delete the object via service
        svc.deleteFile(fileUrl);

        // Ensure deletion by listing objects
        ListObjectsV2Response list = s3Client.listObjectsV2(ListObjectsV2Request.builder().bucket(bucket).prefix("attachments/").build());
        Assertions.assertTrue(list.contents().isEmpty(), "S3 bucket should be empty after delete");
    }
}

