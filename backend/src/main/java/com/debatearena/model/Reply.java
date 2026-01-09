package com.debatearena.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * =====================================================================
 * Reply Entity
 * =====================================================================
 *
 * Represents a reply to a question or another reply.
 * Replies can be nested (replies to replies).
 *
 * CRITICAL RULES:
 * - @JsonIgnore on @ManyToOne to prevent circular references
 * - @JsonIgnore on @OneToMany to prevent serialization errors
 * - fetch = FetchType.LAZY for all relationships
 * - Either questionId OR parentReplyId must be set (not both)
 * - Matches database table: replies
 * - Matches API contract schema: Reply
 *
 * @author TarkVtark Team
 */
@Entity
@Table(name = "replies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reply {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Reply to a question (if this is a direct reply to a question)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    @JsonIgnore
    private Question question;

    // Reply to another reply (if this is a nested reply)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_reply_id")
    @JsonIgnore
    private Reply parentReply;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(nullable = false, length = 10)
    private String side; // "left" or "right" - always opposite of parent

    @Column(nullable = false, length = 100)
    private String author = "Anonymous";

    @Column(name = "votes_up", nullable = false)
    private Integer votesUp = 0;

    @Column(name = "votes_down", nullable = false)
    private Integer votesDown = 0;

    @Column(name = "unique_id", unique = true, length = 100)
    private String uniqueId;

    @Column(nullable = false)
    private Integer depth = 0; // Nesting level: 0 = reply to question, 1 = reply to reply, etc.

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Nested replies (replies to this reply)
    // CRITICAL: @JsonIgnore prevents Jackson serialization errors
    // CRITICAL: fetch = LAZY prevents loading all nested replies
    @OneToMany(mappedBy = "parentReply", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore
    private List<Reply> childReplies = new ArrayList<>();

    /**
     * Helper method to get nested reply count without loading all replies
     * Can be used in DTOs
     */
    @Transient
    public int getChildReplyCount() {
        return childReplies != null ? childReplies.size() : 0;
    }

    /**
     * Convenience method to get the question ID without loading the entire question
     */
    @Transient
    public UUID getQuestionId() {
        return question != null ? question.getId() : null;
    }

    /**
     * Convenience method to get the parent reply ID without loading the entire parent
     */
    @Transient
    public UUID getParentReplyId() {
        return parentReply != null ? parentReply.getId() : null;
    }

    /**
     * Check if this is a direct reply to a question (not a nested reply)
     */
    @Transient
    public boolean isDirectReplyToQuestion() {
        return question != null && parentReply == null;
    }

    /**
     * Check if this is a nested reply (reply to another reply)
     */
    @Transient
    public boolean isNestedReply() {
        return parentReply != null && question == null;
    }
}

