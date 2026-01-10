package com.debatearena.repository;

import com.debatearena.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for User entity
 * Handles database operations for regular users
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Find user by email address
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by Google ID
     */
    Optional<User> findByGoogleId(String googleId);

    /**
     * Check if email already exists
     */
    boolean existsByEmail(String email);

    /**
     * Check if Google ID already exists
     */
    boolean existsByGoogleId(String googleId);

    /**
     * Find active user by email
     */
    Optional<User> findByEmailAndIsActiveTrue(String email);
}

