# 🚀 Complete Full-Stack CRUD Application Guide - Part 3
## Security Configuration & Authentication

---

## 3.9 Configure Security & JWT

### Create JWT Utility

**File:** `backend/src/main/java/com/taskmanager/util/JwtUtil.java`

```java
package com.taskmanager.util;

import com.taskmanager.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    @Value("${JWT_SECRET}")
    private String jwtSecret;

    @Value("${JWT_EXPIRATION_MS:86400000}") // 24 hours default
    private Long jwtExpirationMs;

    /**
     * Generate JWT token for user
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
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Extract user ID from token
     */
    public UUID getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        String userIdStr = claims.get("userId", String.class);
        return UUID.fromString(userIdStr);
    }

    /**
     * Validate token
     */
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    /**
     * Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.getExpiration().before(new Date());
        } catch (ExpiredJwtException ex) {
            return true;
        }
    }

    private Claims parseToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
```

### Create Authentication Service

**File:** `backend/src/main/java/com/taskmanager/service/AuthService.java`

```java
package com.taskmanager.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.taskmanager.dto.GoogleTokenRequest;
import com.taskmanager.dto.UserDTO;
import com.taskmanager.dto.UserLoginResponse;
import com.taskmanager.model.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${GOOGLE_CLIENT_ID:}")
    private String googleClientId;

    /**
     * Authenticate user with Google OAuth token
     */
    public UserLoginResponse authenticateWithGoogle(GoogleTokenRequest request) {
        try {
            Payload payload = verifyGoogleToken(request.getToken());
            
            if (payload == null) {
                return UserLoginResponse.failure("Invalid Google token");
            }

            String googleId = payload.getSubject();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            User user = findOrCreateUser(googleId, email, name, picture);

            String jwtToken = jwtUtil.generateUserToken(user);

            return UserLoginResponse.success(jwtToken, UserDTO.fromEntity(user));

        } catch (Exception e) {
            return UserLoginResponse.failure("Authentication failed");
        }
    }

    /**
     * Validate token and get user
     */
    public Optional<User> validateTokenAndGetUser(String token) {
        try {
            UUID userId = jwtUtil.getUserIdFromToken(token);
            return userRepository.findById(userId);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    /**
     * Verify Google ID token
     */
    private Payload verifyGoogleToken(String idTokenString) 
            throws GeneralSecurityException, IOException {
        
        if (googleClientId == null || googleClientId.isEmpty()) {
            // Development mode: skip verification
            return extractPayloadWithoutVerification(idTokenString);
        }

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        return idToken != null ? idToken.getPayload() : null;
    }

    /**
     * Extract payload without verification (dev only)
     */
    private Payload extractPayloadWithoutVerification(String idTokenString) {
        try {
            String[] parts = idTokenString.split("\\.");
            if (parts.length < 2) return null;

            String payloadJson = new String(
                java.util.Base64.getUrlDecoder().decode(parts[1])
            );
            
            GsonFactory gsonFactory = new GsonFactory();
            return gsonFactory.fromString(payloadJson, Payload.class);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Find existing user or create new one
     */
    private User findOrCreateUser(String googleId, String email, 
                                  String name, String profilePicture) {
        
        Optional<User> existingUser = userRepository.findByGoogleId(googleId);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            
            // Update user info if changed
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

            return updated ? userRepository.save(user) : user;
        } else {
            // Create new user
            User newUser = new User();
            newUser.setGoogleId(googleId);
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setProfilePicture(profilePicture);
            newUser.setIsActive(true);

            return userRepository.save(newUser);
        }
    }
}
```

**File:** `backend/src/main/java/com/taskmanager/dto/GoogleTokenRequest.java`

```java
package com.taskmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleTokenRequest {
    private String token; // Google ID token
}
```

**File:** `backend/src/main/java/com/taskmanager/dto/UserDTO.java`

```java
package com.taskmanager.dto;

import com.taskmanager.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    
    private UUID id;
    private String email;
    private String name;
    private String profilePicture;
    private LocalDateTime createdAt;

    public static UserDTO fromEntity(User user) {
        if (user == null) return null;
        
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setProfilePicture(user.getProfilePicture());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
```

**File:** `backend/src/main/java/com/taskmanager/dto/UserLoginResponse.java`

```java
package com.taskmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
```

### Create Security Configuration

**File:** `backend/src/main/java/com/taskmanager/config/SecurityConfig.java`

```java
package com.taskmanager.config;

import com.taskmanager.service.AuthService;
import com.taskmanager.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final AuthService authService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()  // Public endpoints
                .anyRequest().authenticated()              // Protected endpoints
            )
            .addFilterBefore(jwtAuthenticationFilter(), 
                           UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public OncePerRequestFilter jwtAuthenticationFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request,
                                          HttpServletResponse response,
                                          FilterChain filterChain)
                    throws ServletException, IOException {

                String authHeader = request.getHeader("Authorization");

                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);

                    if (jwtUtil.validateToken(token)) {
                        authService.validateTokenAndGetUser(token).ifPresent(user -> {
                            // Set user in security context
                            SecurityContextHolder.getContext().setAuthentication(
                                new UserAuthentication(user)
                            );
                        });
                    }
                }

                filterChain.doFilter(request, response);
            }
        };
    }
}
```

**File:** `backend/src/main/java/com/taskmanager/config/UserAuthentication.java`

```java
package com.taskmanager.config;

import com.taskmanager.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.Collections;

public class UserAuthentication implements Authentication {

    private final User user;
    private boolean authenticated = true;

    public UserAuthentication(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getDetails() {
        return user;
    }

    @Override
    public Object getPrincipal() {
        return user;
    }

    @Override
    public boolean isAuthenticated() {
        return authenticated;
    }

    @Override
    public void setAuthenticated(boolean isAuthenticated) {
        this.authenticated = isAuthenticated;
    }

    @Override
    public String getName() {
        return user.getEmail();
    }
}
```

### Create Auth Controller

**File:** `backend/src/main/java/com/taskmanager/controller/AuthController.java`

```java
package com.taskmanager.controller;

import com.taskmanager.dto.GoogleTokenRequest;
import com.taskmanager.dto.UserDTO;
import com.taskmanager.dto.UserLoginResponse;
import com.taskmanager.model.User;
import com.taskmanager.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /auth/google - Login with Google OAuth
     */
    @PostMapping("/google")
    public ResponseEntity<UserLoginResponse> loginWithGoogle(
            @RequestBody GoogleTokenRequest request) {
        
        UserLoginResponse response = authService.authenticateWithGoogle(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(response);
        }
    }

    /**
     * GET /auth/me - Get current user info
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "UNAUTHORIZED");
            error.put("message", "Invalid or expired token");
            return ResponseEntity.status(401).body(error);
        }
        
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    /**
     * POST /auth/logout - Logout (client-side token removal)
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }
}
```

### Add dotenv dependency

Update `pom.xml`:

```xml
<dependency>
    <groupId>io.github.cdimascio</groupId>
    <artifactId>dotenv-java</artifactId>
    <version>3.2.0</version>
</dependency>
```

---

**✅ Checkpoint 3: Security & Authentication Complete**

Backend is now fully configured with:
- ✅ JWT token generation and validation
- ✅ Google OAuth integration
- ✅ Spring Security configuration
- ✅ Protected endpoints
- ✅ User authentication flow

**Next:** Frontend development with React

---

*This is Part 3. Continue to Part 4 for Frontend Development.*

