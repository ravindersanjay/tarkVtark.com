package com.debatearena.service;

// ...existing imports...
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.URI;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "file.provider", havingValue = "r2")
public class R2FileStorageService implements FileStorageService {

    @Value("${r2.access-key-id:}")
    private String accessKey;

    @Value("${r2.secret-access-key:}")
    private String secretKey;

    @Value("${r2.bucket:}")
    private String bucket;

    @Value("${r2.endpoint:}")
    private String endpoint;

    @Value("${r2.public-base-url:}")
    private String publicBaseUrl;

    @Value("${r2.region:us-east-1}")
    private String regionName;

    private S3Client s3;

    @PostConstruct
    public void init() {
        AwsBasicCredentials creds = AwsBasicCredentials.create(accessKey, secretKey);
        S3ClientBuilder b = S3Client.builder()
                .credentialsProvider(StaticCredentialsProvider.create(creds))
                .region(Region.of(regionName));

        if (endpoint != null && !endpoint.isBlank()) {
            b.endpointOverride(URI.create(endpoint));
        }

        this.s3 = b.build();
    }

    @Override
    public String uploadFile(MultipartFile file, String customFileName) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String ext = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String key = (customFileName != null ? customFileName : UUID.randomUUID().toString()) + ext;
        key = key.replaceAll("[^a-zA-Z0-9._-]", "_");

        PutObjectRequest putReq = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .acl(ObjectCannedACL.PUBLIC_READ)
                .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .build();

        s3.putObject(putReq, RequestBody.fromBytes(file.getBytes()));

        if (publicBaseUrl != null && !publicBaseUrl.isBlank()) {
            return String.format("%s/%s", publicBaseUrl.replaceAll("/$", ""), key);
        } else if (endpoint != null && !endpoint.isBlank()) {
            return String.format("%s/%s/%s", endpoint.replaceAll("/$", ""), bucket, key);
        } else {
            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, regionName, key);
        }
    }

    @Override
    public void deleteFile(String fileUrl) throws IOException {
        String key = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);

        DeleteObjectRequest delReq = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();

        s3.deleteObject(delReq);
    }

    @Override
    public String getProviderName() {
        return "r2";
    }
}
