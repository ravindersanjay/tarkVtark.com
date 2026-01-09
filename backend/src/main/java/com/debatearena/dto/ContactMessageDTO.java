package com.debatearena.dto;

import com.debatearena.model.ContactMessage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * =====================================================================
 * ContactMessage DTO - For API Responses
 * =====================================================================
 *
 * Data Transfer Object for ContactMessage entity.
 * Used to send contact message data to the frontend.
 *
 * BEST PRACTICE: Controllers return DTOs, never entities.
 *
 * @author TarkVtark Team
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessageDTO {

    private UUID id;
    private String name;
    private String email;
    private String subject;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;

    /**
     * Convert ContactMessage entity to DTO
     */
    public static ContactMessageDTO fromEntity(ContactMessage contactMessage) {
        ContactMessageDTO dto = new ContactMessageDTO();
        dto.setId(contactMessage.getId());
        dto.setName(contactMessage.getName());
        dto.setEmail(contactMessage.getEmail());
        dto.setSubject(contactMessage.getSubject());
        dto.setMessage(contactMessage.getMessage());
        dto.setIsRead(contactMessage.getIsRead());
        dto.setCreatedAt(contactMessage.getCreatedAt());
        return dto;
    }
}

