package com.debatearena.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for Google OAuth login
 * Contains the Google ID token received from frontend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleTokenRequest {
    private String token; // Google ID token (JWT)
}

