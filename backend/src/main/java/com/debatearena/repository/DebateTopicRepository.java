package com.debatearena.repository;

import com.debatearena.model.DebateTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for DebateTopic entity
 * Provides CRUD operations and custom queries
 */
@Repository
public interface DebateTopicRepository extends JpaRepository<DebateTopic, UUID> {

    /**
     * Find all active debate topics
     */
    List<DebateTopic> findByIsActiveTrue();

    /**
     * Find topic by exact name
     */
    Optional<DebateTopic> findByTopic(String topic);

    /**
     * Check if a topic with the given name exists
     */
    boolean existsByTopic(String topic);
}

