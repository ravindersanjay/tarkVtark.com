package com.debatearena.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.UUID;

/**
 * =====================================================================
 * AWS S3 File Storage Service
 * =====================================================================
 *
 * Implementation of FileStorageService for AWS S3 storage.
 *
 * NOTE: This service is NOT auto-registered as a Spring Bean.
 * It is only used when FILE_PROVIDER=s3 in production (AWS Beanstalk).
 * For local development, LocalFileStorageService is used instead.
 *
 * Features:
 * - Upload files to AWS S3 bucket
 * - Generate public URLs for file access
 * - Delete files from S3
 * - Support for different folders/prefixes
 *
 * Configuration (from .env or environment variables):
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - AWS_S3_BUCKET
 * - AWS_REGION (default: us-east-1)
 *
 * @author TarkVtark Team
 */
public class S3FileStorageService implements FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(S3FileStorageService.class);

    private S3Client s3Client;
    
    @Value("${aws.s3.bucket}")
    private String bucketName;
    
    @Value("${aws.region:us-east-1}")
    private String region;
    
    @Value("${aws.s3.base-url:https://s3.amazonaws.com}")
    private String baseUrl;

    /**
     * Constructor - Initialize S3 client with AWS credentials
     */
    public S3FileStorageService(
            @Value("${aws.access-key-id:}") String accessKeyId,
            @Value("${aws.secret-access-key:}") String secretAccessKey,
            @Value("${aws.region:us-east-1}") String regionName) {
        
        try {
            if (accessKeyId != null && !accessKeyId.isEmpty() && 
                secretAccessKey != null && !secretAccessKey.isEmpty()) {
                
                logger.info("✅ Initializing AWS S3 storage service (file.provider=s3)");

                AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
                
                this.s3Client = S3Client.builder()
                        .region(Region.of(regionName))
                        .credentialsProvider(StaticCredentialsProvider.create(credentials))
                        .build();
                        
            } else {
                logger.warn("⚠️ AWS credentials not configured for S3 storage");
                logger.warn("⚠️ If you need S3, set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY");
                this.s3Client = null;
            }
        } catch (Exception e) {
            logger.error("❌ Failed to initialize S3 client", e);
            this.s3Client = null;
        }
    }

    /**
     * Upload a file to S3
     *
     * @param file The file to upload
     * @param folder The folder/prefix in S3 (e.g., "attachments")
     * @return The public S3 URL of the uploaded file
     * @throws IOException If upload fails
     */
    @Override
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String uniqueFileName = generateUniqueFileName(originalFilename);
            String key = (folder != null && !folder.isEmpty()) ? folder + "/" + uniqueFileName : uniqueFileName;

            logger.info("📤 Uploading file to AWS S3: {}", key);

            // Upload to S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // Generate public URL
            String fileUrl = String.format("%s/%s/%s", baseUrl, bucketName, key);
            logger.info("✅ File uploaded successfully to S3: {}", fileUrl);

            return fileUrl;

        } catch (IOException e) {
            logger.error("❌ Failed to upload file to S3", e);
            throw new IOException("Upload to S3 failed: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("❌ Unexpected error during S3 upload", e);
            throw new RuntimeException("S3 upload error: " + e.getMessage(), e);
        }
    }

    /**
     * Delete a file from S3
     *
     * @param fileUrl The URL of the file to delete
     */
    @Override
    public void deleteFile(String fileUrl) throws IOException {
        try {
            // Extract key from URL
            String key = extractKeyFromUrl(fileUrl);
            if (key == null || key.isEmpty()) {
                logger.warn("⚠️ Could not extract S3 key from URL: {}", fileUrl);
                return;
            }

            logger.info("🗑️ Deleting file from S3: {}", key);

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);

            logger.info("✅ File deleted successfully from S3: {}", key);

        } catch (Exception e) {
            logger.error("❌ Failed to delete file from S3", e);
            // Don't throw - log warning but continue
        }
    }

    /**
     * Get storage provider name
     *
     * @return Provider name
     */
    @Override
    public String getProviderName() {
        return "AWS S3";
    }

    /**
     * Get public URL for a file in S3
     *
     * @param key The S3 key of the file
     * @return The public URL
     */
    public String getFileUrl(String key) {
        return String.format("%s/%s/%s", baseUrl, bucketName, key);
    }

    /**
     * Generate a unique filename to avoid collisions
     *
     * @param originalFilename The original filename from upload
     * @return A unique filename with UUID prefix
     */
    private String generateUniqueFileName(String originalFilename) {
        if (originalFilename == null || originalFilename.isEmpty()) {
            originalFilename = "file";
        }

        // Get file extension
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf(".");
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex);
        }

        // Create unique filename with UUID
        String uniqueName = UUID.randomUUID().toString() + extension;
        logger.debug("Generated unique filename: {} -> {}", originalFilename, uniqueName);

        return uniqueName;
    }

    /**
     * Extract S3 key from URL
     *
     * @param fileUrl The S3 URL
     * @return The S3 key
     */
    private String extractKeyFromUrl(String fileUrl) {
        try {
            // URL format: https://s3.amazonaws.com/bucket-name/key
            if (fileUrl == null || fileUrl.isEmpty()) {
                return null;
            }

            // Find the bucket name and extract key after it
            String[] parts = fileUrl.split(bucketName + "/");
            if (parts.length > 1) {
                return parts[1];
            }
            return null;
        } catch (Exception e) {
            logger.error("Error extracting S3 key from URL", e);
            return null;
        }
    }

    /**
     * Check if S3 service is configured
     */
    public boolean isConfigured() {
        return bucketName != null && !bucketName.isEmpty();
    }

    /**
     * Get bucket name
     */
    public String getBucketName() {
        return bucketName;
    }

    /**
     * Close S3 client (cleanup)
     */
    public void close() {
        try {
            if (s3Client != null) {
                s3Client.close();
                logger.info("✅ S3 client closed");
            }
        } catch (Exception e) {
            logger.error("❌ Error closing S3 client", e);
        }
    }
}

