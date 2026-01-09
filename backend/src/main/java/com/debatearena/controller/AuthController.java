package com.debatearena.controller;

import com.debatearena.dto.LoginRequest;
import com.debatearena.dto.LoginResponse;
import com.debatearena.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * =====================================================================
 * Authentication Controller
 * =====================================================================
 *
 * REST API endpoints for admin authentication.
 * Base URL: /api/v1/admin
 *
 * Endpoints:
 * - POST /admin/login - Authenticate admin user
 * - POST /admin/verify - Verify JWT token validity
 *
 * API Contract: Follows api-contract.yaml specifications
 *
 * @author TarkVtark Team
 */
@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /admin/login
     * Authenticate admin user and generate JWT token
     *
     * Request Body: LoginRequest (username, password)
     * Response: LoginResponse (success, token, user info)
     *
     * @param loginRequest Login credentials
     * @return LoginResponse with JWT token if successful
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        System.out.println("📝 POST /admin/login - Login attempt for: " + loginRequest.getUsername());

        try {
            LoginResponse response = authService.authenticate(loginRequest);
            System.out.println("✅ Login successful for: " + loginRequest.getUsername());
            return ResponseEntity.ok(response);

        } catch (RuntimeException ex) {
            System.out.println("❌ Login failed for: " + loginRequest.getUsername());

            // Return generic error message (don't reveal if user exists)
            Map<String, String> error = new HashMap<>();
            error.put("error", "UNAUTHORIZED");
            error.put("message", "Invalid credentials");

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(error);
        }
    }

    /**
     * POST /admin/verify
     * Verify if JWT token is valid and not expired
     *
     * Request Header: Authorization: Bearer <token>
     * Response: {valid: true/false}
     *
     * @param authorizationHeader Authorization header with Bearer token
     * @return Validation result
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyToken(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        System.out.println("🔍 POST /admin/verify - Verifying token");

        Map<String, Object> response = new HashMap<>();

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            System.out.println("❌ Missing or invalid Authorization header");
            response.put("valid", false);
            response.put("message", "Missing or invalid token");
            return ResponseEntity.ok(response);
        }

        String token = authorizationHeader.substring(7); // Remove "Bearer " prefix

        try {
            boolean isValid = authService.validateToken(token);

            if (isValid) {
                String username = authService.getUsernameFromToken(token);
                System.out.println("✅ Token valid for user: " + username);
                response.put("valid", true);
                response.put("username", username);
            } else {
                System.out.println("❌ Token validation failed");
                response.put("valid", false);
                response.put("message", "Invalid or expired token");
            }

            return ResponseEntity.ok(response);

        } catch (Exception ex) {
            System.out.println("❌ Token verification error: " + ex.getMessage());
            response.put("valid", false);
            response.put("message", "Token verification failed");
            return ResponseEntity.ok(response);
        }
    }
}

