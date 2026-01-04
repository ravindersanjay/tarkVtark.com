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
        dto.setStorageUrl(attachment.getStorageUrl());
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

