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
 * Question Entity
 * =====================================================================
 *
 * Represents a top-level question in a debate.
 * Questions belong to a DebateTopic and can have multiple replies.
 *
 * CRITICAL RULES:
 * - @JsonIgnore on @OneToMany to prevent serialization errors
 * - fetch = FetchType.LAZY for all collections
 * - Matches database table: questions
 * - Matches API contract schema: Question
 *
 * @author TarkVtark Team
 */
@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "debate_topic_id", nullable = false)
    @JsonIgnore  // Prevent circular reference
    private DebateTopic debateTopic;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(length = 100)
    private String tag;

    @Column(nullable = false, length = 10)
    private String side; // "left" or "right"

    @Column(nullable = false, length = 100)
    private String author = "Anonymous";

    @Column(name = "votes_up", nullable = false)
    private Integer votesUp = 0;

    @Column(name = "votes_down", nullable = false)
    private Integer votesDown = 0;

    @Column(name = "unique_id", unique = true, length = 100)
    private String uniqueId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationship to replies
    // CRITICAL: @JsonIgnore prevents Jackson serialization errors
    // CRITICAL: fetch = LAZY prevents loading all replies when fetching questions
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnore
    private List<Reply> replies = new ArrayList<>();

    /**
     * Helper method to get reply count without loading all replies
     * Can be used in DTOs
     */
    @Transient
    public int getReplyCount() {
        return replies != null ? replies.size() : 0;
    }

    /**
     * Convenience method to get the debate topic ID without loading the entire topic
     */
    @Transient
    public UUID getDebateTopicId() {
        return debateTopic != null ? debateTopic.getId() : null;
    }
}

