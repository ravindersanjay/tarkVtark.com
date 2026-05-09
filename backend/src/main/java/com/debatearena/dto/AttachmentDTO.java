package com.debatearena.dto;

import com.debatearena.model.Attachment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * =====================================================================
 * Attachment DTO - For API Responses
 * =====================================================================
 *
 * Data Transfer Object for Attachment entity.
 * Used to send attachment data to frontend without exposing internal entity structure.
 *
 * @author TarkVtark Team
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentDTO {

    private UUID id;
    private String fileName;
    private Long fileSize;
    private String fileType;
    private String storageUrl;
    private String storageProvider;
    private String uploadedBy;
    private Integer displayOrder;
    private LocalDateTime createdAt;

    /**
     * Convert Attachment entity to DTO
     */
    public static AttachmentDTO fromEntity(Attachment attachment) {
        if (attachment == null) return null;

        AttachmentDTO dto = new AttachmentDTO();
        dto.setId(attachment.getId());
        dto.setFileName(attachment.getFileName());
        dto.setFileSize(attachment.getFileSize());
        dto.setFileType(attachment.getFileType());
        // Normalize storage URL: for local storage return a full backend download URL
        String provider = attachment.getStorageProvider();
        String storage = attachment.getStorageUrl();
        if (provider != null && provider.equalsIgnoreCase("local")) {
            try {
                String baseUrl = System.getProperty("file.base-url");
                if (baseUrl == null || baseUrl.isEmpty()) baseUrl = System.getenv().getOrDefault("FILE_BASE_URL", "http://localhost");
                String port = System.getProperty("server.port");
                if ((port == null || port.isEmpty()) && System.getenv().get("SERVER_PORT") != null) port = System.getenv("SERVER_PORT");
                // ensure baseUrl contains protocol
                if (!baseUrl.startsWith("http")) baseUrl = "http://" + baseUrl;
                String host = baseUrl;
                // append port if baseUrl doesn't already include it
                if (port != null && !port.isEmpty() && !baseUrl.matches(".*:\\d+$")) {
                    host = baseUrl + ":" + port;
                }
                // Use the internal storage key endpoint for downloads (no encoded slashes)
                String storageKey = attachment.getStorageUrl(); // e.g., attachments/uuid.jpg
                dto.setStorageUrl(host + "/api/v1/files/key/" + storageKey);
            } catch (Exception e) {
                dto.setStorageUrl(storage);
            }
        } else {
            dto.setStorageUrl(storage);
        }
        dto.setStorageProvider(attachment.getStorageProvider());
        dto.setUploadedBy(attachment.getUploadedBy());
        dto.setDisplayOrder(attachment.getDisplayOrder());
        dto.setCreatedAt(attachment.getCreatedAt());
        return dto;
    }

    /**
     * Get file size in human-readable format
     */
    public String getFileSizeFormatted() {
        if (fileSize == null) return "0 B";

        double size = fileSize;
        String[] units = {"B", "KB", "MB", "GB"};
        int unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return String.format("%.1f %s", size, units[unitIndex]);
    }
}

