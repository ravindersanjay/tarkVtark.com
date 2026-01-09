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
 * Reply DTO - For API Responses
 * =====================================================================
 *
 * Data Transfer Object for Reply entity.
 * Includes nested replies for threaded conversation display.
 *
 * @author TarkVtark Team
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReplyDTO {

    private UUID id;
    private UUID questionId;
    private UUID parentReplyId;
    private String text;
    private String side;
    private String author;
    private Integer votesUp;
    private Integer votesDown;
    private String uniqueId;
    private Integer depth;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Nested replies for threaded conversations
    private List<ReplyDTO> replies = new ArrayList<>();

    // Evidence and attachments
    private List<AttachmentDTO> attachments = new ArrayList<>();
    private List<EvidenceUrlDTO> evidenceUrls = new ArrayList<>();

    /**
     * Convert Reply entity to DTO with nested replies
     */
    public static ReplyDTO fromEntity(com.debatearena.model.Reply reply) {
        ReplyDTO dto = new ReplyDTO();
        dto.setId(reply.getId());
        dto.setQuestionId(reply.getQuestion() != null ? reply.getQuestion().getId() : null);
        dto.setParentReplyId(reply.getParentReply() != null ? reply.getParentReply().getId() : null);
        dto.setText(reply.getText());
        dto.setSide(reply.getSide());
        dto.setAuthor(reply.getAuthor());
        dto.setVotesUp(reply.getVotesUp());
        dto.setVotesDown(reply.getVotesDown());
        dto.setUniqueId(reply.getUniqueId());
        dto.setDepth(reply.getDepth());
        dto.setCreatedAt(reply.getCreatedAt());
        dto.setUpdatedAt(reply.getUpdatedAt());

        // Recursively convert nested replies (using childReplies from entity)
        if (reply.getChildReplies() != null && !reply.getChildReplies().isEmpty()) {
            dto.setReplies(reply.getChildReplies().stream()
                .map(ReplyDTO::fromEntity)
                .toList());
        }

        return dto;
    }
}

