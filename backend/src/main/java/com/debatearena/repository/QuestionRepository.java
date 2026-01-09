package com.debatearena.repository;

import com.debatearena.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Question entity
 * Provides CRUD operations and custom queries
 */
@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {

    /**
     * Find all questions for a specific debate topic
     */
    List<Question> findByDebateTopic_Id(UUID debateTopicId);

    /**
     * Find all questions for a specific debate topic, ordered by creation date
     */
    List<Question> findByDebateTopic_IdOrderByCreatedAtDesc(UUID debateTopicId);

    /**
     * Find question by unique ID
     */
    Optional<Question> findByUniqueId(String uniqueId);

    /**
     * Find all questions by tag
     */
    List<Question> findByTag(String tag);

    /**
     * Find all questions on a specific side (left or right)
     */
    List<Question> findBySide(String side);
}

