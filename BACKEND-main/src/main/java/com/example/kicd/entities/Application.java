package com.example.kicd.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "applications", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"opportunity_id", "student_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_id")
    private Long applicationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opportunity_id", nullable = false)
    private Opportunity opportunity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private ApplicantProfile student;

    @Column(length = 50, nullable = false)
    private String status; // "PENDING", "SHORTLISTED", "REJECTED", "ACCEPTED"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "approval_date")
    private java.time.LocalDateTime approvalDate;

    @Column(name = "resume_url", columnDefinition = "TEXT")
    private String resumeUrl;

    @Column(name = "id_document_url", columnDefinition = "TEXT")
    private String idDocumentUrl;

    @Column(name = "rejection_reason", length = 255)
    private String rejectionReason;

    @Column(name = "timesheet_logged_percentage")
    private Integer timesheetLoggedPercentage;

    @Column(name = "logbook_status", length = 50)
    private String logbookStatus;

    @Column(name = "compliance_risk", length = 50)
    private String complianceRisk;

    @Column(name = "overall_score", precision = 3, scale = 2)
    private java.math.BigDecimal overallScore;

    @Column(length = 50)
    private String punctuality;

    @Column(length = 50)
    private String teamwork;

    @Column(name = "supervisor_recommendation", length = 100)
    private String supervisorRecommendation;

    @Column(name = "exit_completion_status", length = 50)
    private String exitCompletionStatus;

    @Column(name = "conversion_status", length = 50)
    private String conversionStatus;

    @Column(name = "exit_survey_sentiment", precision = 3, scale = 2)
    private java.math.BigDecimal exitSurveySentiment;

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private OffsetDateTime submittedAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
