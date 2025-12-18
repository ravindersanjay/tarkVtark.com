package com.debatearena.controller;

import com.debatearena.model.Question;
import com.debatearena.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * =====================================================================
 * Question Controller
 * =====================================================================
 *
 * REST API endpoints for debate questions.
 * Matches API contract: api-contract.yaml
 *
 * Base URL: /api/v1/questions
 *
 * Endpoints:
 * - GET  /questions/topic/{topicId} - Get all questions for a topic
 * - GET  /questions/{questionId} - Get specific question by ID
 * - POST /questions - Create new question
 * - PUT  /questions/{questionId} - Update question
 * - DELETE /questions/{questionId} - Delete question
 * - PUT  /questions/{questionId}/vote - Vote on question
 *
 * @author TarkVtark Team
 */
@RestController
@RequestMapping("/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionRepository questionRepository;

    /**
     * GET /questions/topic/{topicId}
     * Get all questions for a specific debate topic
     *
     * @param topicId UUID of the debate topic
     * @return List of questions
     */
    @GetMapping("/topic/{topicId}")
    public ResponseEntity<List<Question>> getQuestionsByTopic(@PathVariable UUID topicId) {
        List<Question> questions = questionRepository.findByDebateTopic_Id(topicId);
        return ResponseEntity.ok(questions);
    }

    /**
     * GET /questions/{questionId}
     * Get a specific question by ID
     *
     * @param questionId UUID of the question
     * @return The question
     */
    @GetMapping("/{questionId}")
    public ResponseEntity<Question> getQuestionById(@PathVariable UUID questionId) {
        return questionRepository.findById(questionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /questions
     * Create a new question
     *
     * @param question The question to create
     * @return The created question
     */
    @PostMapping
    public ResponseEntity<Question> createQuestion(@RequestBody Question question) {
        Question savedQuestion = questionRepository.save(question);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedQuestion);
    }

    /**
     * PUT /questions/{questionId}
     * Update an existing question
     *
     * @param questionId UUID of the question to update
     * @param updatedQuestion The updated question data
     * @return The updated question
     */
    @PutMapping("/{questionId}")
    public ResponseEntity<Question> updateQuestion(
            @PathVariable UUID questionId,
            @RequestBody Question updatedQuestion) {

        return questionRepository.findById(questionId)
                .map(existingQuestion -> {
                    // Update fields
                    existingQuestion.setText(updatedQuestion.getText());
                    existingQuestion.setTag(updatedQuestion.getTag());
                    existingQuestion.setSide(updatedQuestion.getSide());
                    existingQuestion.setAuthor(updatedQuestion.getAuthor());

                    // Save and return
                    Question saved = questionRepository.save(existingQuestion);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * DELETE /questions/{questionId}
     * Delete a question (and all associated replies via cascade)
     *
     * @param questionId UUID of the question to delete
     * @return No content
     */
    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable UUID questionId) {
        if (!questionRepository.existsById(questionId)) {
            return ResponseEntity.notFound().build();
        }

        questionRepository.deleteById(questionId);
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /questions/{questionId}/vote
     * Vote on a question (upvote or downvote)
     *
     * @param questionId UUID of the question
     * @param voteRequest Contains voteType: "up" or "down"
     * @return The updated question with new vote counts
     */
    @PutMapping("/{questionId}/vote")
    public ResponseEntity<Question> voteOnQuestion(
            @PathVariable UUID questionId,
            @RequestBody VoteRequest voteRequest) {

        // Validate vote type first
        if (!"up".equalsIgnoreCase(voteRequest.voteType) &&
            !"down".equalsIgnoreCase(voteRequest.voteType)) {
            return ResponseEntity.badRequest().build();
        }

        return questionRepository.findById(questionId)
                .map(question -> {
                    if ("up".equalsIgnoreCase(voteRequest.voteType)) {
                        question.setVotesUp(question.getVotesUp() + 1);
                    } else {
                        question.setVotesDown(question.getVotesDown() + 1);
                    }

                    Question saved = questionRepository.save(question);
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

