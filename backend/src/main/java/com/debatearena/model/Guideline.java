package com.debatearena.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * =====================================================================
 * Guideline Entity
 * =====================================================================
 *
 * Represents a community guideline in the debate application.
 * Guidelines are displayed to users to maintain quality discussions.
 *
 * BEST PRACTICES APPLIED:
 * - No @OneToMany or @ManyToOne relationships (avoiding Jackson issues)
 * - Simple entity with basic fields
 * - Uses DTOs for API responses
 *
 * @author TarkVtark Team
 */
@Entity
@Table(name = "guidelines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Guideline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "text", nullable = false, length = 1000)
    private String text;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

