package com.debatearena.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * =====================================================================
 * Login Request DTO
 * =====================================================================
 *
 * Data Transfer Object for admin login requests.
 * Matches API contract: LoginRequest schema
 *
 * Used by: POST /api/v1/admin/login
 *
 * @author TarkVtark Team
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;
}

