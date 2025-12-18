package com.debatearena.repository;

import com.debatearena.model.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for AdminUser entity
 * Provides CRUD operations and custom queries
 */
@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, UUID> {

    /**
     * Find admin user by username
     */
    Optional<AdminUser> findByUsername(String username);

    /**
     * Find admin user by email
     */
    Optional<AdminUser> findByEmail(String email);

    /**
     * Check if username exists
     */
    boolean existsByUsername(String username);

    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);

    /**
     * Find active admin user by username
     */
    Optional<AdminUser> findByUsernameAndIsActiveTrue(String username);
}

