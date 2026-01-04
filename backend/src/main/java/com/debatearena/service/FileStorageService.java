package com.debatearena.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * =====================================================================
 * File Storage Service Interface
 * =====================================================================
 *
 * Interface for file storage operations.
 * Implementations can use different storage backends:
 * - Local filesystem (for development)
 * - AWS S3 (for production)
 * - Cloudinary (for media files)
 *
 * @author TarkVtark Team
 */
public interface FileStorageService {

    /**
     * Upload a file to storage
     *
     * @param file The file to upload
     * @param fileName Custom file name (optional, will generate UUID if null)
     * @return Public URL to access the file
     * @throws IOException if upload fails
     */
    String uploadFile(MultipartFile file, String fileName) throws IOException;

    /**
     * Delete a file from storage
     *
     * @param fileUrl The URL of the file to delete
     * @throws IOException if deletion fails
     */
    void deleteFile(String fileUrl) throws IOException;

    /**
     * Get the storage provider name
     *
     * @return Provider name: "local", "s3", or "cloudinary"
     */
    String getProviderName();
}

