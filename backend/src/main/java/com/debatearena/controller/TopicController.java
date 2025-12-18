package com.debatearena.controller;

import com.debatearena.model.DebateTopic;
import com.debatearena.repository.DebateTopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * =====================================================================
 * Topic Controller
 * =====================================================================
 *
 * REST API endpoints for debate topics.
 * Matches API contract: api-contract.yaml
 *
 * Base URL: /api/v1/topics
 *
 * Endpoints:
 * - GET  /topics - Get all debate topics
 * - GET  /topics/{topicId} - Get specific topic by ID
 * - POST /topics - Create new topic
 *
 * @author TarkVtark Team
 */
@RestController
@RequestMapping("/topics")
@RequiredArgsConstructor
public class TopicController {

    private final DebateTopicRepository debateTopicRepository;

    /**
     * GET /topics
     * Get all debate topics
     *
     * @return List of all debate topics
     */
    @GetMapping
    public ResponseEntity<List<DebateTopic>> getAllTopics() {
        List<DebateTopic> topics = debateTopicRepository.findAll();
        return ResponseEntity.ok(topics);
    }

    /**
     * GET /topics/{topicId}
     * Get a specific topic by ID
     *
     * @param topicId UUID of the topic
     * @return The debate topic
     */
    @GetMapping("/{topicId}")
    public ResponseEntity<DebateTopic> getTopicById(@PathVariable UUID topicId) {
        return debateTopicRepository.findById(topicId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /topics
     * Create a new debate topic
     *
     * @param topic The topic to create
     * @return The created topic
     */
    @PostMapping
    public ResponseEntity<DebateTopic> createTopic(@RequestBody DebateTopic topic) {
        // Check if topic with same name already exists
        if (debateTopicRepository.existsByTopic(topic.getTopic())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // Save the new topic
        DebateTopic savedTopic = debateTopicRepository.save(topic);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTopic);
    }

    /**
     * PUT /topics/{topicId}
     * Update an existing debate topic
     *
     * @param topicId UUID of the topic to update
     * @param updatedTopic The updated topic data
     * @return The updated topic
     */
    @PutMapping("/{topicId}")
    public ResponseEntity<DebateTopic> updateTopic(
            @PathVariable UUID topicId,
            @RequestBody DebateTopic updatedTopic) {

        return debateTopicRepository.findById(topicId)
                .map(existingTopic -> {
                    // Update fields
                    existingTopic.setTopic(updatedTopic.getTopic());
                    existingTopic.setLeftLabel(updatedTopic.getLeftLabel());
                    existingTopic.setRightLabel(updatedTopic.getRightLabel());
                    existingTopic.setDescription(updatedTopic.getDescription());
                    existingTopic.setIsActive(updatedTopic.getIsActive());

                    // Save and return
                    DebateTopic saved = debateTopicRepository.save(existingTopic);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * DELETE /topics/{topicId}
     * Delete a debate topic (and all associated questions/replies via cascade)
     *
     * @param topicId UUID of the topic to delete
     * @return No content
     */
    @DeleteMapping("/{topicId}")
    public ResponseEntity<Void> deleteTopic(@PathVariable UUID topicId) {
        if (!debateTopicRepository.existsById(topicId)) {
            return ResponseEntity.notFound().build();
        }

        debateTopicRepository.deleteById(topicId);
        return ResponseEntity.noContent().build();
    }
}

