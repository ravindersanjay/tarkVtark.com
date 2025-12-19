package com.debatearena.repository;

import com.debatearena.model.Guideline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * =====================================================================
 * Guideline Repository
 * =====================================================================
 *
 * Data access layer for Guideline entity.
 *
 * @author TarkVtark Team
 */
@Repository
public interface GuidelineRepository extends JpaRepository<Guideline, Long> {

    /**
     * Find all active guidelines ordered by display order
     */
    List<Guideline> findByIsActiveTrueOrderByDisplayOrderAsc();

    /**
     * Find all guidelines ordered by display order
     */
    List<Guideline> findAllByOrderByDisplayOrderAsc();
}

