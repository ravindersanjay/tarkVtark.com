package com.debatearena.dto;

import com.debatearena.model.DebateTopic;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * =====================================================================
 * Topic DTO - For API Responses
 * =====================================================================
 *
 * Data Transfer Object for DebateTopic entity.
 * Includes question count for the topic list view.
 *
 * This DTO is used to send topic data with question counts to the frontend,
 * avoiding the need to load all questions when fetching the topic list.
 *
 * @author TarkVtark Team
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopicDTO {

    private UUID id;
    private String topic;
    private String leftLabel;
    private String rightLabel;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Question count for the topic
    private Long questionCount;

    /**
     * Convert DebateTopic entity to DTO with question count
     */
    public static TopicDTO fromEntity(DebateTopic topic, Long questionCount) {
        TopicDTO dto = new TopicDTO();
        dto.setId(topic.getId());
        dto.setTopic(topic.getTopic());
        dto.setLeftLabel(topic.getLeftLabel());
        dto.setRightLabel(topic.getRightLabel());
        dto.setDescription(topic.getDescription());
        dto.setIsActive(topic.getIsActive());
        dto.setCreatedAt(topic.getCreatedAt());
        dto.setUpdatedAt(topic.getUpdatedAt());
        dto.setQuestionCount(questionCount != null ? questionCount : 0L);
        return dto;
    }

    /**
     * Convert DebateTopic entity to DTO without question count
     */
    public static TopicDTO fromEntity(DebateTopic topic) {
        return fromEntity(topic, 0L);
    }
}
