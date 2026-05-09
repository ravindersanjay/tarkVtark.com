package com.debatearena.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * =====================================================================
 * Local File Storage Service
 * =====================================================================
 *
 * Implementation of FileStorageService for local filesystem storage.
 * Used for development and testing.
 *
 * IMPORTANT:
 * - Files are stored in ./uploads directory (configurable)
 * - Files are accessible via HTTP at /api/v1/files/{filename}
 * - NOT suitable for production (use S3 or Cloudinary instead)
 * - No redundancy or backup
 *
 * @author TarkVtark Team
 */
@Service
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "file.provider", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageService implements FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(LocalFileStorageService.class);

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${file.base-url:http://localhost}")
    private String baseUrl;

    /**
     * Upload a file to local storage
     */
    @Override
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        // Create uploads directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            logger.info("Created upload directory: {}", uploadPath.toAbsolutePath());
        }

        // Ensure folder is safe
        String safeFolder = (folder == null || folder.isBlank()) ? "" : folder.replaceAll("[^a-zA-Z0-9/_-]", "_");
        Path destFolder = safeFolder.isEmpty() ? uploadPath : uploadPath.resolve(safeFolder);
        if (!Files.exists(destFolder)) {
            Files.createDirectories(destFolder);
        }

        // Generate unique filename preserving extension
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + fileExtension;
        // Ensure filename is safe
        fileName = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");

        // Save file
        Path filePath = destFolder.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        logger.info("File uploaded successfully: {} ({} bytes)", filePath.toAbsolutePath(), file.getSize());

        // Return storage key relative to uploadDir (e.g., attachments/uuid.png or uuid.png)
        String storageKey = (safeFolder.isEmpty() ? "" : safeFolder + "/") + fileName;
        return storageKey;
    }

    /**
     * Delete a file from local storage
     */
    @Override
    public void deleteFile(String fileUrl) throws IOException {
        // Extract filename from URL
        String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

        Path filePath = Paths.get(uploadDir).resolve(fileName);

        if (Files.exists(filePath)) {
            Files.delete(filePath);
            logger.info("File deleted successfully: {}", fileName);
        } else {
            logger.warn("File not found for deletion: {}", fileName);
        }
    }

    /**
     * Get provider name
     */
    @Override
    public String getProviderName() {
        return "local";
    }
}
