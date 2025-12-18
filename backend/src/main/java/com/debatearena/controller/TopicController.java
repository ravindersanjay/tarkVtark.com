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
}

