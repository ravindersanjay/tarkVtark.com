package com.debatearena.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * =====================================================================
 * Login Response DTO
 * =====================================================================
 *
 * Data Transfer Object for admin login responses.
 * Matches API contract: LoginResponse schema
 *
 * Used by: POST /api/v1/admin/login
 *
 * @author TarkVtark Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private Boolean success;
    private String token;
    private UserInfo user;

    /**
     * Nested user information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private UUID id;
        private String username;
        private String email;
        private String fullName;
    }
}

