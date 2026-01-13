package com.debatearena.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for user authentication
 * Contains JWT token and user info
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginResponse {
    private boolean success;
    private String token;
    private UserDTO user;
    private String message;

    public static UserLoginResponse success(String token, UserDTO user) {
        return new UserLoginResponse(true, token, user, "Login successful");
    }

    public static UserLoginResponse failure(String message) {
        return new UserLoginResponse(false, null, null, message);
    }
}

