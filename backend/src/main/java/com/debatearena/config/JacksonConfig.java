package com.debatearena.config;

import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Jackson Configuration for Hibernate Lazy Loading
 *
 * This configuration prevents Jackson serialization errors when dealing with
 * Hibernate lazy-loaded collections and proxies.
 *
 * CRITICAL: This works in combination with @JsonIgnore on entity relationships.
 * Always add @JsonIgnore to @OneToMany and bidirectional @ManyToOne relationships.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Module hibernateModule() {
        Hibernate6Module module = new Hibernate6Module();
        // Disable forcing lazy loading - only serialize initialized collections
        module.disable(Hibernate6Module.Feature.FORCE_LAZY_LOADING);
        return module;
    }
}

