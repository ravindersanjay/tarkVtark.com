package com.debatearena.dto;

import com.debatearena.model.EvidenceUrl;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * =====================================================================
 * Evidence URL DTO - For API Responses
 * =====================================================================
 *
 * Data Transfer Object for EvidenceUrl entity.
 * Used to send evidence URL data to frontend.
 *
 * @author TarkVtark Team
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceUrlDTO {

    private UUID id;
    private String url;
    private String title;
    private Integer displayOrder;
    private LocalDateTime createdAt;

    /**
     * Convert EvidenceUrl entity to DTO
     */
    public static EvidenceUrlDTO fromEntity(EvidenceUrl evidenceUrl) {
        if (evidenceUrl == null) return null;

        EvidenceUrlDTO dto = new EvidenceUrlDTO();
        dto.setId(evidenceUrl.getId());
        dto.setUrl(evidenceUrl.getUrl());
        dto.setTitle(evidenceUrl.getTitle());
        dto.setDisplayOrder(evidenceUrl.getDisplayOrder());
        dto.setCreatedAt(evidenceUrl.getCreatedAt());
        return dto;
    }
}

