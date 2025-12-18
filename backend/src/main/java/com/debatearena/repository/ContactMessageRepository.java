package com.debatearena.repository;

import com.debatearena.model.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for ContactMessage entity
 * Provides CRUD operations and custom queries
 */
@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, UUID> {

    /**
     * Find all unread messages
     */
    List<ContactMessage> findByIsReadFalse();

    /**
     * Find all read messages
     */
    List<ContactMessage> findByIsReadTrue();

    /**
     * Find messages by email address
     */
    List<ContactMessage> findByEmail(String email);

    /**
     * Count unread messages
     */
    long countByIsReadFalse();
}

