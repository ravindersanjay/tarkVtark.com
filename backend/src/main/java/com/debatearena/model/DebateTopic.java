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
 * DebateTopic Entity
 * =====================================================================
 *
 * Represents a debate topic (e.g., "Sanatan vs Islam").
 *
 * CRITICAL RULES:
 * - @JsonIgnore on @OneToMany to prevent serialization errors
 * - fetch = FetchType.LAZY for all collections
 * - Matches database table: debate_topics
 * - Matches API contract schema: DebateTopic
 *
 * @author TarkVtark Team
 */
@Entity
@Table(name = "debate_topics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DebateTopic {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String topic;

    @Column(name = "left_label", nullable = false, length = 100)
    private String leftLabel;

    @Column(name = "right_label", nullable = false, length = 100)
    private String rightLabel;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationship to questions
    // CRITICAL: @JsonIgnore prevents Jackson serialization errors
    // CRITICAL: fetch = LAZY prevents loading all questions when fetching topics
    @OneToMany(mappedBy = "debateTopic", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Question> questions = new ArrayList<>();

    /**
     * Helper method to get question count without loading all questions
     * Can be used in DTOs
     */
    @Transient
    public int getQuestionCount() {
        return questions != null ? questions.size() : 0;
    }
}

