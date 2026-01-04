package com.debatearena.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * =====================================================================
 * Attachment Entity
 * =====================================================================
 *
 * Represents a file attachment (image, video, PDF, etc.) for questions or replies.
 * Actual files are stored in external storage (S3, Cloudinary, or local filesystem).
 * This entity stores only metadata and the URL to access the file.
 *
 * IMPORTANT:
 * - Either questionId OR replyId must be set (not both)
 * - Cascade delete: Deleting a question/reply deletes its attachments
 * - storageUrl should be publicly accessible (or use signed URLs)
 *
 * @author TarkVtark Team
 */
@Entity
@Table(name = "attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Parent relationship - question
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    @JsonIgnore  // Prevent circular reference
    private Question question;

    // Parent relationship - reply
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_id")
    @JsonIgnore  // Prevent circular reference
    private Reply reply;

    // File metadata
    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;  // Size in bytes

    @Column(name = "file_type", nullable = false, length = 100)
    private String fileType;  // MIME type: image/jpeg, application/pdf, etc.

    // External storage reference
    @Column(name = "storage_url", nullable = false, columnDefinition = "TEXT")
    private String storageUrl;  // Full URL to access the file

    @Column(name = "storage_provider", length = 50)
    private String storageProvider = "local";  // 'local', 's3', 'cloudinary'

    // Additional metadata
    @Column(name = "uploaded_by", length = 100)
    private String uploadedBy = "Anonymous";

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Get the parent question ID without loading the entire question
     */
    @Transient
    public UUID getQuestionId() {
        return question != null ? question.getId() : null;
    }

    /**
     * Get the parent reply ID without loading the entire reply
     */
    @Transient
    public UUID getReplyId() {
        return reply != null ? reply.getId() : null;
    }

    /**
     * Check if this attachment belongs to a question
     */
    @Transient
    public boolean isQuestionAttachment() {
        return question != null && reply == null;
    }

    /**
     * Check if this attachment belongs to a reply
     */
    @Transient
    public boolean isReplyAttachment() {
        return reply != null && question == null;
    }

    /**
     * Get file size in human-readable format
     */
    @Transient
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

