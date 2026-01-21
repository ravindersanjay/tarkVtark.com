package com.debatearena.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * =====================================================================
 * Security Configuration
 * =====================================================================
 *
 * Configures Spring Security for the application.
 *
 * Security Rules:
 * - Allow public access to login endpoint
 * - Allow public access to all existing endpoints (backward compatibility)
 * - Enable CORS for frontend communication
 * - Disable CSRF (using JWT tokens)
 * - Stateless session management
 *
 * BCrypt Configuration:
 * - Strength: 12 (from .env)
 * - Used for password hashing and verification
 *
 * @author TarkVtark Team
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Configure HTTP security rules
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())   // IMPORTANT for multipart
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/v1/files/upload"
                        ).permitAll()
                        .anyRequest().authenticated()
                );

        return http.build();
    }


    /**
     * CORS configuration to allow frontend requests
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow frontend origin
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://localhost:8080",

                // Production domains
                "https://www.debatemanch.com",
                "https://debatemanch.com"
        ));

        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));

        // Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // Cache CORS preflight response for 1 hour
        configuration.setMaxAge(3600L);

        // Expose authorization header
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    /**
     * BCrypt password encoder bean
     * Strength: 12 (configurable via .env)
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        // BCrypt strength 12 is a good balance between security and performance
        return new BCryptPasswordEncoder(12);
    }
}

