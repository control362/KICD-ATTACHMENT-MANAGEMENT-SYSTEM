package com.example.kicd.DTOS.opportunity;

import com.example.kicd.entities.Opportunity;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
public class OpportunityDTO {
    private Long opportunityId;
    private String title;
    private Long departmentId;
    private String departmentName;
    private String description;
    private String requirements;
    private Integer numberOfSlots;
    private LocalDate applicationDeadline;
    private String status;
    private String referenceNumber;
    private String type;
    private String benefits;
    private String duration;
    private String location;
    private String workArrangement;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean featured;
    private String imageUrl;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<OpportunityDocumentDTO> documents;

    @Data
    @Builder
    public static class OpportunityDocumentDTO {
        private Long documentId;
        private String documentName;
        private Boolean isRequired;
    }

    public static OpportunityDTO fromEntity(Opportunity opp) {
        return OpportunityDTO.builder()
                .opportunityId(opp.getOpportunityId())
                .title(opp.getTitle())
                .departmentId(opp.getDepartment().getDepartmentId())
                .departmentName(opp.getDepartment().getName())
                .description(opp.getDescription())
                .requirements(opp.getRequirements())
                .numberOfSlots(opp.getNumberOfSlots())
                .applicationDeadline(opp.getApplicationDeadline())
                .referenceNumber(opp.getReferenceNumber())
                .type(opp.getType())
                .benefits(opp.getBenefits())
                .duration(opp.getDuration())
                .location(opp.getLocation())
                .workArrangement(opp.getWorkArrangement())
                .startDate(opp.getStartDate())
                .endDate(opp.getEndDate())
                .featured(opp.getFeatured())
                .imageUrl(opp.getImageUrl())
                .status(opp.getStatus())
                .createdAt(opp.getCreatedAt())
                .updatedAt(opp.getUpdatedAt())
                .documents(new java.util.ArrayList<>()) // Should be populated by the service
                .build();
    }
}
