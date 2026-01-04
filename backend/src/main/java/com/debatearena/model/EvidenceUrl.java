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
 * Evidence URL Entity
 * =====================================================================
 *
 * Represents an external URL used as evidence for questions or replies.
 * Examples: YouTube videos, articles, research papers, news sources, etc.
 *
 * IMPORTANT:
 * - Either questionId OR replyId must be set (not both)
 * - Cascade delete: Deleting a question/reply deletes its evidence URLs
 * - URLs are stored as-is (not validated or archived)
 *
 * @author TarkVtark Team
 */
@Entity
@Table(name = "evidence_urls")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceUrl {

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

    // URL data
    @Column(name = "url", nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(name = "title", length = 255)
    private String title;  // Optional: page title or description

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
     * Check if this URL belongs to a question
     */
    @Transient
    public boolean isQuestionEvidence() {
        return question != null && reply == null;
    }

    /**
     * Check if this URL belongs to a reply
     */
    @Transient
    public boolean isReplyEvidence() {
        return reply != null && question == null;
    }
}

