package com.debatearena.controller;

import com.debatearena.model.Question;
import com.debatearena.model.Reply;
import com.debatearena.repository.QuestionRepository;
import com.debatearena.repository.ReplyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * =====================================================================
 * Reply Controller
 * =====================================================================
 *
 * REST API endpoints for debate replies.
 * Matches API contract: api-contract.yaml
 *
 * Base URL: /api/v1/replies
 *
 * Endpoints:
 * - GET  /replies/question/{questionId} - Get all replies for a question
 * - GET  /replies/{replyId} - Get specific reply by ID
 * - POST /replies - Create new reply
 * - PUT  /replies/{replyId} - Update reply
 * - DELETE /replies/{replyId} - Delete reply
 * - PUT  /replies/{replyId}/vote - Vote on reply
 *
 * @author TarkVtark Team
 */
@RestController
@RequestMapping("/replies")
@RequiredArgsConstructor
public class ReplyController {

    private final ReplyRepository replyRepository;
    private final QuestionRepository questionRepository;

    /**
     * GET /replies/question/{questionId}
     * Get all direct replies to a question
     *
     * @param questionId UUID of the question
     * @return List of replies
     */
    @GetMapping("/question/{questionId}")
    public ResponseEntity<List<Reply>> getRepliesByQuestion(@PathVariable UUID questionId) {
        List<Reply> replies = replyRepository.findByQuestion_Id(questionId);
        return ResponseEntity.ok(replies);
    }

    /**
     * GET /replies/{replyId}
     * Get a specific reply by ID
     *
     * @param replyId UUID of the reply
     * @return The reply
     */
    @GetMapping("/{replyId}")
    public ResponseEntity<Reply> getReplyById(@PathVariable UUID replyId) {
        return replyRepository.findById(replyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /replies
     * Create a new reply (to a question or another reply)
     *
     * @param requestBody Map containing reply data
     * @return The created reply
     */
    @PostMapping
    public ResponseEntity<Reply> createReply(@RequestBody Map<String, Object> requestBody) {
        // LOG INPUT
        System.out.println("📥 ReplyController.createReply() - Request body: " + requestBody);

        Reply reply = new Reply();

        // Better validation
        boolean hasQuestion = requestBody.containsKey("question") && requestBody.get("question") != null;
        boolean hasParentReply = requestBody.containsKey("parentReply") && requestBody.get("parentReply") != null;

        System.out.println("🔍 hasQuestion: " + hasQuestion + ", hasParentReply: " + hasParentReply);

        if (!hasQuestion && !hasParentReply) {
            System.err.println("❌ Error: Must specify either question or parentReply");
            return ResponseEntity.badRequest().build();
        }

        try {
            // Handle question reference
            if (hasQuestion) {
                Map<String, Object> questionMap = (Map<String, Object>) requestBody.get("question");
                UUID questionId = UUID.fromString(questionMap.get("id").toString());
                System.out.println("🔍 Looking for question: " + questionId);
                Question question = questionRepository.findById(questionId)
                        .orElseThrow(() -> new RuntimeException("Question not found: " + questionId));
                reply.setQuestion(question);
                System.out.println("✅ Question set successfully");
            }

            // Handle parent reply reference
            if (hasParentReply) {
                Map<String, Object> parentMap = (Map<String, Object>) requestBody.get("parentReply");
                UUID parentId = UUID.fromString(parentMap.get("id").toString());
                System.out.println("🔍 Looking for parent reply: " + parentId);
                Reply parentReply = replyRepository.findById(parentId)
                        .orElseThrow(() -> new RuntimeException("Parent reply not found: " + parentId));
                reply.setParentReply(parentReply);
                System.out.println("✅ Parent reply set successfully");
            }

            // Set other fields
            reply.setText(requestBody.get("text").toString());
            reply.setSide(requestBody.get("side").toString());
            reply.setAuthor(requestBody.get("author") != null ? requestBody.get("author").toString() : "Anonymous");
            reply.setDepth(requestBody.get("depth") != null ? Integer.parseInt(requestBody.get("depth").toString()) : 0);
            reply.setUniqueId(requestBody.get("uniqueId") != null ? requestBody.get("uniqueId").toString() : null);
            reply.setVotesUp(0);
            reply.setVotesDown(0);

            System.out.println("✅ All fields set, saving reply...");
            Reply savedReply = replyRepository.save(reply);
            System.out.println("✅ Reply saved successfully: " + savedReply.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(savedReply);
        } catch (Exception e) {
            System.err.println("❌ Error creating reply: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create reply: " + e.getMessage(), e);
        }
    }

    /**
     * PUT /replies/{replyId}
     * Update an existing reply
     *
     * @param replyId UUID of the reply to update
     * @param updatedReply The updated reply data
     * @return The updated reply
     */
    @PutMapping("/{replyId}")
    public ResponseEntity<Reply> updateReply(
            @PathVariable UUID replyId,
            @RequestBody Reply updatedReply) {

        return replyRepository.findById(replyId)
                .map(existingReply -> {
                    // Update fields
                    existingReply.setText(updatedReply.getText());
                    existingReply.setSide(updatedReply.getSide());
                    existingReply.setAuthor(updatedReply.getAuthor());

                    // Save and return
                    Reply saved = replyRepository.save(existingReply);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * DELETE /replies/{replyId}
     * Delete a reply (and all nested replies via cascade)
     *
     * @param replyId UUID of the reply to delete
     * @return No content
     */
    @DeleteMapping("/{replyId}")
    public ResponseEntity<Void> deleteReply(@PathVariable UUID replyId) {
        if (!replyRepository.existsById(replyId)) {
            return ResponseEntity.notFound().build();
        }

        replyRepository.deleteById(replyId);
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /replies/{replyId}/vote
     * Vote on a reply (upvote or downvote)
     *
     * @param replyId UUID of the reply
     * @param voteRequest Contains voteType: "up" or "down"
     * @return The updated reply with new vote counts
     */
    @PutMapping("/{replyId}/vote")
    public ResponseEntity<Reply> voteOnReply(
            @PathVariable UUID replyId,
            @RequestBody VoteRequest voteRequest) {

        // Validate vote type first
        if (!"up".equalsIgnoreCase(voteRequest.voteType) &&
            !"down".equalsIgnoreCase(voteRequest.voteType)) {
            return ResponseEntity.badRequest().build();
        }

        return replyRepository.findById(replyId)
                .map(reply -> {
                    if ("up".equalsIgnoreCase(voteRequest.voteType)) {
                        reply.setVotesUp(reply.getVotesUp() + 1);
                    } else {
                        reply.setVotesDown(reply.getVotesDown() + 1);
                    }

                    Reply saved = replyRepository.save(reply);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Inner class for vote requests
     */
    public static class VoteRequest {
        public String voteType; // "up" or "down"
    }
}

