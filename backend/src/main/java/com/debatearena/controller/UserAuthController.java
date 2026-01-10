package com.debatearena.controller;

import com.debatearena.dto.GoogleTokenRequest;
import com.debatearena.dto.UserDTO;
import com.debatearena.dto.UserLoginResponse;
import com.debatearena.model.User;
import com.debatearena.service.UserAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * =====================================================================
 * User Authentication Controller
 * =====================================================================
 *
 * REST API endpoints for regular user authentication (Google OAuth).
 * Separate from admin authentication.
 *
 * Base URL: /api/v1/auth
 *
 * Endpoints:
 * - POST /auth/google - Login with Google
 * - GET  /auth/me - Get current user info
 * - POST /auth/logout - Logout current user
 *
 * @author TarkVtark Team
 */
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class UserAuthController {

    private final UserAuthService userAuthService;

    /**
     * POST /auth/google
     * Authenticate user with Google ID token
     *
     * @param request Contains Google ID token
     * @return Login response with JWT and user info
     */
    @PostMapping("/google")
    public ResponseEntity<UserLoginResponse> loginWithGoogle(@RequestBody GoogleTokenRequest request) {
        System.out.println("📱 POST /auth/google - Google OAuth login attempt");

        if (request.getToken() == null || request.getToken().isEmpty()) {
            System.out.println("❌ Missing Google token");
            return ResponseEntity
                    .badRequest()
                    .body(UserLoginResponse.failure("Google token is required"));
        }

        UserLoginResponse response = userAuthService.authenticateWithGoogle(request);

        if (response.isSuccess()) {
            System.out.println("✅ Google login successful");
            return ResponseEntity.ok(response);
        } else {
            System.out.println("❌ Google login failed");
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response);
        }
    }

    /**
     * GET /auth/me
     * Get current authenticated user info
     *
     * @param authHeader Authorization header with Bearer token
     * @return Current user info
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        System.out.println("👤 GET /auth/me - Get current user");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("❌ Missing or invalid Authorization header");
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(createError("Missing or invalid token"));
        }

        String token = authHeader.substring(7); // Remove "Bearer " prefix

        Optional<User> userOpt = userAuthService.validateTokenAndGetUser(token);

        if (userOpt.isPresent()) {
            UserDTO userDTO = UserDTO.fromEntity(userOpt.get());
            System.out.println("✅ User found: " + userDTO.getEmail());
            return ResponseEntity.ok(userDTO);
        } else {
            System.out.println("❌ Invalid token or user not found");
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(createError("Invalid token"));
        }
    }

    /**
     * POST /auth/logout
     * Logout current user (client-side token removal)
     *
     * Note: JWT tokens are stateless, so logout is handled client-side
     * This endpoint is for consistency and future enhancements
     *
     * @return Success response
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        System.out.println("👋 POST /auth/logout - User logout");

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");

        return ResponseEntity.ok(response);
    }

    /**
     * GET /auth/validate
     * Validate token (check if user is authenticated)
     *
     * @param authHeader Authorization header
     * @return Validation result
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        System.out.println("🔍 GET /auth/validate - Validate token");

        Map<String, Object> response = new HashMap<>();

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("valid", false);
            response.put("message", "Missing or invalid token");
            return ResponseEntity.ok(response);
        }

        String token = authHeader.substring(7);
        Optional<User> userOpt = userAuthService.validateTokenAndGetUser(token);

        if (userOpt.isPresent()) {
            response.put("valid", true);
            response.put("user", UserDTO.fromEntity(userOpt.get()));
            return ResponseEntity.ok(response);
        } else {
            response.put("valid", false);
            response.put("message", "Invalid or expired token");
            return ResponseEntity.ok(response);
        }
    }

    /**
     * Helper method to create error response
     */
    private Map<String, String> createError(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "UNAUTHORIZED");
        error.put("message", message);
        return error;
    }
}

