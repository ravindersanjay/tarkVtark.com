package com.debatearena.service;

import com.debatearena.dto.GoogleTokenRequest;
import com.debatearena.dto.UserDTO;
import com.debatearena.dto.UserLoginResponse;
import com.debatearena.model.User;
import com.debatearena.repository.UserRepository;
import com.debatearena.util.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * =====================================================================
 * User Authentication Service
 * =====================================================================
 *
 * Handles Google OAuth authentication for regular users
 * Separate from AdminAuthService (which uses username/password)
 *
 * Flow:
 * 1. Verify Google ID token
 * 2. Extract user info from token
 * 3. Create or update user in database
 * 4. Generate our own JWT token
 * 5. Return token and user info
 *
 * @author TarkVtark Team
 */
@Service
@Slf4j
@Service
@RequiredArgsConstructor
public class UserAuthService {

    log.info("Google OAuth login attempt");
    log.debug("Google token received");
    log.warn("Invalid Google token");

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${google.client-id:}")
    private String googleClientId;

    /**
     * Authenticate user with Google ID token
     *
     * @param request Contains Google ID token
     * @return Login response with JWT and user info
     */
    public UserLoginResponse authenticateWithGoogle(GoogleTokenRequest request) {
        System.out.println("🔐 Authenticating with Google token...");

        try {
            // Verify Google token and extract user info
            Payload payload = verifyGoogleToken(request.getToken());

            if (payload == null) {
                System.out.println("❌ Invalid Google token");
                return UserLoginResponse.failure("Invalid Google token");
            }

            // Extract user info from Google token
            String googleId = payload.getSubject();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            System.out.println("✅ Google token verified for: " + email);

            // Find or create user
            User user = findOrCreateUser(googleId, email, name, picture);

            // Update last login
            user.updateLastLogin();
            userRepository.save(user);

            // Generate our own JWT token for this user
            String jwtToken = jwtUtil.generateUserToken(user);

            System.out.println("✅ User authenticated successfully: " + user.getEmail());

            return UserLoginResponse.success(jwtToken, UserDTO.fromEntity(user));

        } catch (GeneralSecurityException | IOException e) {
            System.err.println("❌ Error verifying Google token: " + e.getMessage());
            return UserLoginResponse.failure("Failed to verify Google token");
        } catch (Exception e) {
            System.err.println("❌ Unexpected error during authentication: " + e.getMessage());
            e.printStackTrace();
            return UserLoginResponse.failure("Authentication failed");
        }
    }

    /**
     * Verify Google ID token and extract payload
     */
    private Payload verifyGoogleToken(String idTokenString) throws GeneralSecurityException, IOException {
        // If no Google Client ID configured, skip verification (dev mode)
        if (googleClientId == null || googleClientId.isEmpty()) {
            System.out.println("⚠️ WARNING: Google Client ID not configured. Token verification skipped!");
            System.out.println("⚠️ This is acceptable for development but MUST be configured for production.");
            return extractPayloadWithoutVerification(idTokenString);
        }

        // Support comma-separated list of client IDs (allows frontend and backend IDs)
        List<String> audiences = Arrays.stream(googleClientId.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        if (audiences.isEmpty()) {
            // Fallback to original behavior
            System.out.println("⚠️ google.client-id resolved to empty after parsing. Skipping verification.");
            return extractPayloadWithoutVerification(idTokenString);
        }

        System.out.println("🔍 Verifying Google token against clientId: [" + googleClientId + "]");

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                new GsonFactory())
                .setAudience(audiences)
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);

        if (idToken != null) {
            return idToken.getPayload();
        }

        return null;
    }

    /**
     * Extract payload without verification (development only)
     * WARNING: Do not use in production!
     */
    private Payload extractPayloadWithoutVerification(String idTokenString) {
        try {
            // Parse token parts
            String[] parts = idTokenString.split("\\.");
            if (parts.length < 2) {
                return null;
            }

            // Decode payload (base64url)
            String payloadJson = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));

            // Parse JSON to Payload
            GsonFactory gsonFactory = new GsonFactory();
            return gsonFactory.fromString(payloadJson, Payload.class);

        } catch (Exception e) {
            System.err.println("❌ Error parsing token: " + e.getMessage());
            return null;
        }
    }

    /**
     * Find existing user or create new one
     */
    private User findOrCreateUser(String googleId, String email, String name, String profilePicture) {
        Optional<User> existingUser = userRepository.findByGoogleId(googleId);

        if (existingUser.isPresent()) {
            // User exists, update info if changed
            User user = existingUser.get();
            boolean updated = false;

            if (!email.equals(user.getEmail())) {
                user.setEmail(email);
                updated = true;
            }

            if (!name.equals(user.getName())) {
                user.setName(name);
                updated = true;
            }

            if (profilePicture != null && !profilePicture.equals(user.getProfilePicture())) {
                user.setProfilePicture(profilePicture);
                updated = true;
            }

            if (updated) {
                System.out.println("📝 Updating existing user: " + email);
                return userRepository.save(user);
            }

            return user;
        } else {
            // Create new user
            System.out.println("➕ Creating new user: " + email);

            User newUser = new User();
            newUser.setGoogleId(googleId);
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setProfilePicture(profilePicture);
            newUser.setIsActive(true);

            return userRepository.save(newUser);
        }
    }

    /**
     * Get user by ID
     */
    public Optional<User> getUserById(UUID userId) {
        return userRepository.findById(userId);
    }

    /**
     * Validate JWT token and extract user
     */
    public Optional<User> validateTokenAndGetUser(String token) {
        try {
            UUID userId = jwtUtil.extractUserIdFromToken(token);
            if (userId != null) {
                return userRepository.findById(userId);
            }
        } catch (Exception e) {
            System.err.println("❌ Error validating token: " + e.getMessage());
        }
        return Optional.empty();
    }
}

