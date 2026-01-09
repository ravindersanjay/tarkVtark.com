package com.debatearena.service;

import com.debatearena.dto.LoginRequest;
import com.debatearena.dto.LoginResponse;
import com.debatearena.model.AdminUser;
import com.debatearena.repository.AdminUserRepository;
import com.debatearena.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * =====================================================================
 * Authentication Service
 * =====================================================================
 *
 * Handles admin user authentication and session management.
 *
 * Features:
 * - Validate login credentials
 * - Generate JWT tokens
 * - Update last login timestamp
 *
 * Security:
 * - Uses BCrypt for password hashing
 * - Validates against database records
 * - Only active users can login
 *
 * @author TarkVtark Team
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminUserRepository adminUserRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * Authenticate admin user with username and password
     *
     * @param loginRequest Login credentials
     * @return LoginResponse with token and user info if successful
     * @throws RuntimeException if authentication fails
     */
    @Transactional
    public LoginResponse authenticate(LoginRequest loginRequest) {
        System.out.println("🔐 Authenticating user: " + loginRequest.getUsername());

        // Find active user by username
        Optional<AdminUser> userOptional = adminUserRepository
                .findByUsernameAndIsActiveTrue(loginRequest.getUsername());

        if (userOptional.isEmpty()) {
            System.out.println("❌ User not found or inactive: " + loginRequest.getUsername());
            throw new RuntimeException("Invalid credentials");
        }

        AdminUser user = userOptional.get();

        // Verify password using BCrypt
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            System.out.println("❌ Invalid password for user: " + loginRequest.getUsername());
            throw new RuntimeException("Invalid credentials");
        }

        System.out.println("✅ Authentication successful for user: " + loginRequest.getUsername());

        // Update last login timestamp
        user.setLastLogin(LocalDateTime.now());
        adminUserRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getUsername());

        // Build response
        LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();

        return LoginResponse.builder()
                .success(true)
                .token(token)
                .user(userInfo)
                .build();
    }

    /**
     * Validate JWT token
     *
     * @param token JWT token
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }

    /**
     * Get username from JWT token
     *
     * @param token JWT token
     * @return Username
     */
    public String getUsernameFromToken(String token) {
        return jwtUtil.getUsernameFromToken(token);
    }
}

