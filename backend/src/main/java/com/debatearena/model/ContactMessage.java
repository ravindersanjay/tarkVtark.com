package com.debatearena.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * =====================================================================
 * ContactMessage Entity
 * =====================================================================
 *
 * Represents a message submitted through the contact form.
 *
 * Matches database table: contact_messages
 * Matches API contract schema: ContactRequest/ContactResponse
 *
 * @author TarkVtark Team
 */
@Entity
@Table(name = "contact_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(length = 200)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Mark message as read
     */
    public void markAsRead() {
        this.isRead = true;
    }

    /**
     * Mark message as unread
     */
    public void markAsUnread() {
        this.isRead = false;
    }
}

