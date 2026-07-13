package com.example.kicd.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "opportunities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Opportunity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "opportunity_id")
    private Long opportunityId;

    @Column(name = "reference_number", unique = true, length = 100)
    private String referenceNumber;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 50)
    private String type; // e.g. "Internship", "Industrial Attachment"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(length = 50)
    private String duration;

    @Column(length = 150)
    private String location;

    @Column(name = "work_arrangement", length = 50)
    private String workArrangement;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "number_of_slots", nullable = false)
    private Integer numberOfSlots;

    @Column(name = "application_deadline", nullable = false)
    private LocalDate applicationDeadline;

    @Column(length = 20, nullable = false)
    private String status; // "OPEN", "CLOSED", "DRAFT", "PUBLISHED", "EXPIRED"

    @Column(nullable = false)
    private Boolean featured = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
