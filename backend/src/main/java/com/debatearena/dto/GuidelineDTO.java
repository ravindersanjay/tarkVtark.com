package com.debatearena.dto;

import com.debatearena.model.Guideline;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * =====================================================================
 * Guideline DTO - For API Responses
 * =====================================================================
 *
 * Data Transfer Object for Guideline entity.
 * Used to send guideline data to the frontend.
 *
 * BEST PRACTICE: Controllers return DTOs, never entities.
 *
 * @author TarkVtark Team
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GuidelineDTO {

    private Long id;
    private String text;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Convert Guideline entity to DTO
     */
    public static GuidelineDTO fromEntity(Guideline guideline) {
        GuidelineDTO dto = new GuidelineDTO();
        dto.setId(guideline.getId());
        dto.setText(guideline.getText());
        dto.setDisplayOrder(guideline.getDisplayOrder());
        dto.setIsActive(guideline.getIsActive());
        dto.setCreatedAt(guideline.getCreatedAt());
        dto.setUpdatedAt(guideline.getUpdatedAt());
        return dto;
    }
}

