package com.example.kicd.DTOS.opportunity;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class OpportunityRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotBlank(message = "Description is required")
    private String description;

    private String requirements;

    @NotNull(message = "Number of slots is required")
    @Positive(message = "Number of slots must be greater than zero")
    private Integer numberOfSlots;

    @NotNull(message = "Application deadline is required")
    @FutureOrPresent(message = "Application deadline must be today or in the future")
    private LocalDate applicationDeadline;

    @NotBlank(message = "Status is required (OPEN, DRAFT, PUBLISHED, etc)")
    private String status;

    private String type;
    private String benefits;
    private String duration;
    private String location;
    private String workArrangement;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean featured;

    private List<OpportunityDocumentRequest> documents;

    @Data
    public static class OpportunityDocumentRequest {
        private String documentName;
        private Boolean isRequired;
    }
}
