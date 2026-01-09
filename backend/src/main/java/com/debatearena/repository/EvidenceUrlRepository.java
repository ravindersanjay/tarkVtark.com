package com.debatearena.repository;

import com.debatearena.model.EvidenceUrl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * =====================================================================
 * Evidence URL Repository
 * =====================================================================
 *
 * Repository for managing evidence URLs.
 * Provides methods to find evidence URLs by question or reply.
 *
 * @author TarkVtark Team
 */
@Repository
public interface EvidenceUrlRepository extends JpaRepository<EvidenceUrl, UUID> {

    /**
     * Find all evidence URLs for a specific question
     * Ordered by display_order for consistent UI presentation
     */
    @Query("SELECT e FROM EvidenceUrl e WHERE e.question.id = :questionId ORDER BY e.displayOrder ASC, e.createdAt ASC")
    List<EvidenceUrl> findByQuestionId(@Param("questionId") UUID questionId);

    /**
     * Find all evidence URLs for a specific reply
     * Ordered by display_order for consistent UI presentation
     */
    @Query("SELECT e FROM EvidenceUrl e WHERE e.reply.id = :replyId ORDER BY e.displayOrder ASC, e.createdAt ASC")
    List<EvidenceUrl> findByReplyId(@Param("replyId") UUID replyId);

    /**
     * Delete all evidence URLs for a specific question
     * Used when deleting a question manually (cascade should handle this automatically)
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM EvidenceUrl e WHERE e.question.id = :questionId")
    void deleteByQuestionId(@Param("questionId") UUID questionId);

    /**
     * Delete all evidence URLs for a specific reply
     * Used when deleting a reply manually (cascade should handle this automatically)
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM EvidenceUrl e WHERE e.reply.id = :replyId")
    void deleteByReplyId(@Param("replyId") UUID replyId);

    /**
     * Count evidence URLs for a question
     */
    @Query("SELECT COUNT(e) FROM EvidenceUrl e WHERE e.question.id = :questionId")
    long countByQuestionId(@Param("questionId") UUID questionId);

    /**
     * Count evidence URLs for a reply
     */
    @Query("SELECT COUNT(e) FROM EvidenceUrl e WHERE e.reply.id = :replyId")
    long countByReplyId(@Param("replyId") UUID replyId);
}

