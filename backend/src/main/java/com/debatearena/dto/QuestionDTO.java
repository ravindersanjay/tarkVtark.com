package com.debatearena.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * =====================================================================
 * Question DTO - For API Responses
 * =====================================================================
 *
 * Data Transfer Object for Question entity.
 * Includes nested replies for complete question data.
 *
 * This DTO is used to send question data with replies to the frontend,
 * avoiding Jackson serialization issues with @OneToMany relationships.
 *
 * @author TarkVtark Team
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDTO {

    private UUID id;
    private UUID debateTopicId;
    private String text;
    private String tag;
    private String side;
    private String author;
    private Integer votesUp;
    private Integer votesDown;
    private String uniqueId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Nested replies - this is the key difference from entity
    private List<ReplyDTO> replies = new ArrayList<>();

    /**
     * Convert Question entity to DTO with replies
     */
    public static QuestionDTO fromEntity(com.debatearena.model.Question question, List<com.debatearena.model.Reply> replies) {
        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setDebateTopicId(question.getDebateTopicId());
        dto.setText(question.getText());
        dto.setTag(question.getTag());
        dto.setSide(question.getSide());
        dto.setAuthor(question.getAuthor());
        dto.setVotesUp(question.getVotesUp());
        dto.setVotesDown(question.getVotesDown());
        dto.setUniqueId(question.getUniqueId());
        dto.setCreatedAt(question.getCreatedAt());
        dto.setUpdatedAt(question.getUpdatedAt());

        // Convert top-level replies to DTOs (replies where parentReply is null)
        if (replies != null) {
            dto.setReplies(replies.stream()
                .filter(r -> r.getParentReply() == null) // Only direct replies to question
                .map(ReplyDTO::fromEntity)
                .toList());
        }

        return dto;
    }
}

