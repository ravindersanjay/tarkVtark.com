package com.debatearena.repository;

import com.debatearena.model.Reply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Reply entity
 * Provides CRUD operations and custom queries
 */
@Repository
public interface ReplyRepository extends JpaRepository<Reply, UUID> {

    /**
     * Find all direct replies to a question
     */
    List<Reply> findByQuestion_Id(UUID questionId);

    /**
     * Find all nested replies to a reply
     */
    List<Reply> findByParentReply_Id(UUID parentReplyId);

    /**
     * Find reply by unique ID
     */
    Optional<Reply> findByUniqueId(String uniqueId);

    /**
     * Find all replies at a specific depth level
     */
    List<Reply> findByDepth(Integer depth);
}

