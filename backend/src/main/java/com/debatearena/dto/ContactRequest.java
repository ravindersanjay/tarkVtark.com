package com.debatearena.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * =====================================================================
 * Contact Request DTO
 * =====================================================================
 *
 * Request object for submitting contact messages.
 * Used when users submit the contact form.
 *
 * @author TarkVtark Team
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactRequest {
    private String name;
    private String email;
    private String subject;
    private String message;
}

