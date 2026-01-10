package com.debatearena.util;

import com.debatearena.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * =====================================================================
 * JWT Utility Class
 * =====================================================================
 *
 * Handles JWT token generation and validation for authentication.
 * Supports both admin users and regular users (Google OAuth).
 *
 * Features:
 * - Generate JWT tokens with user details
 * - Validate JWT tokens
 * - Extract user info from token
 * - Check token expiration
 *
 * Configuration (from .env):
 * - JWT_SECRET: Secret key for signing tokens
 * - JWT_EXPIRATION_MS: Token expiration time in milliseconds
 *
 * @author TarkVtark Team
 */
@Component
public class JwtUtil {

    @Value("${JWT_SECRET:TarkVtark2026SecureJWTSecretKeyForDebateArenaApplicationMinimum32Characters}")
    private String jwtSecret;

    @Value("${JWT_EXPIRATION_MS:86400000}")
    private Long jwtExpirationMs;

    /**
     * Generate JWT token for authenticated user
     *
     * @param userId User's UUID
     * @param username User's username
     * @return JWT token string
     */
    public String generateToken(UUID userId, String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId.toString())
                .claim("type", "admin")  // Mark as admin token
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Generate JWT token for regular user (Google OAuth)
     *
     * @param user User entity
     * @return JWT token string
     */
    public String generateUserToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId", user.getId().toString())
                .claim("name", user.getName())
                .claim("email", user.getEmail())
                .claim("type", "user")  // Mark as user token
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Extract username from JWT token
     *
     * @param token JWT token
     * @return Username
     */
    public String getUsernameFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.getSubject();
    }

    /**
     * Extract user ID from JWT token
     *
     * @param token JWT token
     * @return User UUID
     */
    public UUID getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        String userIdStr = claims.get("userId", String.class);
        return UUID.fromString(userIdStr);
    }

    /**
     * Extract user ID from JWT token (alias for consistency)
     *
     * @param token JWT token
     * @return User UUID
     */
    public UUID extractUserIdFromToken(String token) {
        return getUserIdFromToken(token);
    }

    /**
     * Get token type (admin or user)
     *
     * @param token JWT token
     * @return "admin" or "user"
     */
    public String getTokenType(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.get("type", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Validate JWT token
     *
     * @param token JWT token
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (MalformedJwtException ex) {
            System.err.println("Invalid JWT token: " + ex.getMessage());
        } catch (ExpiredJwtException ex) {
            System.err.println("Expired JWT token: " + ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            System.err.println("Unsupported JWT token: " + ex.getMessage());
        } catch (IllegalArgumentException ex) {
            System.err.println("JWT claims string is empty: " + ex.getMessage());
        }
        return false;
    }

    /**
     * Check if token is expired
     *
     * @param token JWT token
     * @return true if expired, false otherwise
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.getExpiration().before(new Date());
        } catch (ExpiredJwtException ex) {
            return true;
        } catch (Exception ex) {
            return true;
        }
    }

    /**
     * Parse JWT token and extract claims
     *
     * @param token JWT token
     * @return Claims object
     */
    private Claims parseToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

