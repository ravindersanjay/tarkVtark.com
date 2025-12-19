package com.debatearena.controller;

import com.debatearena.dto.GuidelineDTO;
import com.debatearena.model.Guideline;
import com.debatearena.repository.GuidelineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * =====================================================================
 * Admin Controller
 * =====================================================================
 *
 * REST API endpoints for admin-related operations.
 * Base URL: /api/v1/admin
 *
 * Endpoints:
 * - GET    /admin/guidelines - Get all active guidelines (public view)
 * - GET    /admin/guidelines/all - Get all guidelines (admin view)
 * - POST   /admin/guidelines - Create new guideline
 * - PUT    /admin/guidelines/{id} - Update guideline
 * - DELETE /admin/guidelines/{id} - Delete guideline
 * - GET    /admin/faq - Get FAQ items
 *
 * @author TarkVtark Team
 */
@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AdminController {

    private final GuidelineRepository guidelineRepository;

    /**
     * GET /admin/guidelines
     * Get all active community guidelines (for public view)
     *
     * @return List of guideline strings
     */
    @GetMapping("/guidelines")
    public ResponseEntity<List<String>> getGuidelines() {
        System.out.println("📋 GET /admin/guidelines - Fetching active guidelines");

        List<Guideline> guidelines = guidelineRepository.findByIsActiveTrueOrderByDisplayOrderAsc();

        // If no guidelines in database, initialize with defaults
        if (guidelines.isEmpty()) {
            System.out.println("⚠️ No guidelines in database, initializing defaults...");
            initializeDefaultGuidelines();
            guidelines = guidelineRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        }

        // Return just the text (for public view)
        List<String> guidelineTexts = guidelines.stream()
                .map(Guideline::getText)
                .collect(Collectors.toList());

        System.out.println("✅ Returning " + guidelineTexts.size() + " active guidelines");
        return ResponseEntity.ok(guidelineTexts);
    }

    /**
     * GET /admin/guidelines/all
     * Get all guidelines including inactive ones (for admin management)
     *
     * @return List of guideline DTOs
     */
    @GetMapping("/guidelines/all")
    public ResponseEntity<List<GuidelineDTO>> getAllGuidelines() {
        System.out.println("📋 GET /admin/guidelines/all - Fetching all guidelines");

        List<Guideline> guidelines = guidelineRepository.findAllByOrderByDisplayOrderAsc();
        List<GuidelineDTO> dtos = guidelines.stream()
                .map(GuidelineDTO::fromEntity)
                .collect(Collectors.toList());

        System.out.println("✅ Returning " + dtos.size() + " guidelines (including inactive)");
        return ResponseEntity.ok(dtos);
    }

    /**
     * POST /admin/guidelines
     * Create a new guideline
     *
     * @param request Contains text for the new guideline
     * @return Created guideline DTO
     */
    @PostMapping("/guidelines")
    public ResponseEntity<GuidelineDTO> createGuideline(@RequestBody GuidelineRequest request) {
        System.out.println("📝 POST /admin/guidelines - Creating new guideline: " + request.text);

        // Get the next display order
        List<Guideline> allGuidelines = guidelineRepository.findAll();
        int nextOrder = allGuidelines.isEmpty() ? 1 :
            allGuidelines.stream().mapToInt(Guideline::getDisplayOrder).max().orElse(0) + 1;

        Guideline guideline = new Guideline();
        guideline.setText(request.text);
        guideline.setDisplayOrder(nextOrder);
        guideline.setIsActive(true);

        Guideline saved = guidelineRepository.save(guideline);
        System.out.println("✅ Guideline created with ID: " + saved.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(GuidelineDTO.fromEntity(saved));
    }

    /**
     * PUT /admin/guidelines/{id}
     * Update an existing guideline
     *
     * @param id Guideline ID
     * @param request Contains updated text and/or status
     * @return Updated guideline DTO
     */
    @PutMapping("/guidelines/{id}")
    public ResponseEntity<GuidelineDTO> updateGuideline(
            @PathVariable Long id,
            @RequestBody GuidelineRequest request) {
        System.out.println("📝 PUT /admin/guidelines/" + id + " - Updating guideline");

        return guidelineRepository.findById(id)
                .map(guideline -> {
                    if (request.text != null) {
                        guideline.setText(request.text);
                    }
                    if (request.isActive != null) {
                        guideline.setIsActive(request.isActive);
                    }
                    if (request.displayOrder != null) {
                        guideline.setDisplayOrder(request.displayOrder);
                    }
                    Guideline saved = guidelineRepository.save(guideline);
                    System.out.println("✅ Guideline updated: " + saved.getId());
                    return ResponseEntity.ok(GuidelineDTO.fromEntity(saved));
                })
                .orElseGet(() -> {
                    System.out.println("❌ Guideline not found: " + id);
                    return ResponseEntity.notFound().build();
                });
    }

    /**
     * DELETE /admin/guidelines/{id}
     * Delete a guideline
     *
     * @param id Guideline ID
     * @return No content
     */
    @DeleteMapping("/guidelines/{id}")
    public ResponseEntity<Void> deleteGuideline(@PathVariable Long id) {
        System.out.println("🗑️ DELETE /admin/guidelines/" + id + " - Deleting guideline");

        if (guidelineRepository.existsById(id)) {
            guidelineRepository.deleteById(id);
            System.out.println("✅ Guideline deleted: " + id);
            return ResponseEntity.noContent().build();
        }

        System.out.println("❌ Guideline not found: " + id);
        return ResponseEntity.notFound().build();
    }

    /**
     * Initialize default guidelines if database is empty
     */
    private void initializeDefaultGuidelines() {
        List<String> defaults = Arrays.asList(
            "सवाल : आपने चोरी की है क्या?",
            "सही जवाब : मैने चोरी नहीं की ✅",
            "सही जवाब : हां मैने चोरी  की  है✅",
            "सही जवाब : आपको लगता है मैंने चोरी की है तो सबूत दिखाओै✅",
            "गलत जवाब : आप ने भी तो चोरी की है❌",
            "गलत जवाब : नेता और अधिकारी भी तो चोरी करते है।❌",
            "गलत जवाब : किसी भ्रष्ट धनवान से धन चुराकर किसी निर्धन की सहायता करने में क्या गलत है ❌",
            "Be respectful and constructive in your arguments.",
            "No hate speech, personal attacks, or discrimination.",
            "Support your points with evidence where possible.",
            "Stay on topic and avoid spamming.",
            "Report inappropriate content to moderators."
        );

        for (int i = 0; i < defaults.size(); i++) {
            Guideline guideline = new Guideline();
            guideline.setText(defaults.get(i));
            guideline.setDisplayOrder(i + 1);
            guideline.setIsActive(true);
            guidelineRepository.save(guideline);
        }
        System.out.println("✅ Initialized " + defaults.size() + " default guidelines");
    }

    /**
     * GET /admin/faq
     * Get FAQ items
     *
     * @return List of FAQ objects with question and answer
     */
    @GetMapping("/faq")
    public ResponseEntity<List<FAQItem>> getFAQ() {
        System.out.println("📋 GET /admin/faq - Fetching FAQ items");

        List<FAQItem> faqItems = Arrays.asList(
            new FAQItem("How do I participate in a debate?", "Click on any debate topic to view and reply to questions and answers."),
            new FAQItem("Can I report inappropriate content?", "Yes, please use the Contact Us page to report any issues."),
            new FAQItem("How many times can I vote a question or an answer?", "One question or one answer can be voted only once.")
        );

        System.out.println("✅ Returning " + faqItems.size() + " FAQ items");
        return ResponseEntity.ok(faqItems);
    }

    /**
     * Request class for guideline operations
     */
    public static class GuidelineRequest {
        public String text;
        public Boolean isActive;
        public Integer displayOrder;
    }

    /**
     * Inner class for FAQ items
     */
    public static class FAQItem {
        public String q;
        public String a;

        public FAQItem(String q, String a) {
            this.q = q;
            this.a = a;
        }
    }
}

