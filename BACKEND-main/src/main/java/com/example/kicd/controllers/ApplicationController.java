package com.example.kicd.controllers;

import com.example.kicd.entities.Application;
import com.example.kicd.security.UserPrincipal;
import com.example.kicd.serviceInterfaces.ApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/opportunity/{opportunityId}")
    public ResponseEntity<java.util.Map<String, Object>> applyForOpportunity(
            @PathVariable Long opportunityId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Application application = applicationService.applyForOpportunity(userPrincipal.getUserId(), opportunityId);
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("applicationId", application.getApplicationId());
        response.put("status", application.getStatus());
        response.put("submittedAt", application.getSubmittedAt());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/opportunity/{opportunityId}")
    public ResponseEntity<List<Application>> getApplicationsForOpportunity(@PathVariable Long opportunityId) {
        return ResponseEntity.ok(applicationService.getApplicationsForOpportunity(opportunityId));
    }

    @GetMapping("/me")
    public ResponseEntity<List<Application>> getMyApplications(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(applicationService.getMyApplications(userPrincipal.getUserId()));
    }

    @PutMapping("/{applicationId}/submit")
    public ResponseEntity<Application> submitApplication(
            @PathVariable Long applicationId,
            @RequestBody com.example.kicd.DTOS.ApplicationSubmitRequest request) {
        return ResponseEntity.ok(applicationService.submitApplication(applicationId, request.getResumeUrl(), request.getIdDocumentUrl()));
    }

    @PutMapping("/{applicationId}/status")
    public ResponseEntity<Application> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestParam String status) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(applicationId, status));
    }

    @DeleteMapping("/{applicationId}")
    public ResponseEntity<Void> deleteDraftApplication(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal UserPrincipal principal) {
        applicationService.deleteDraftApplication(applicationId, principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/pending")
    public List<Application> getPendingApplications() {
        return applicationService.getPendingApplications();
    }

    @GetMapping("/approved")
    public List<Application> getApprovedApplications() {
        return applicationService.getApprovedApplications();
    }

    @GetMapping("/rejected")
    public List<Application> getRejectedApplications() {
        return applicationService.getRejectedApplications();
    }

    @PutMapping("/{applicationId}/approve")
    public Application approveApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long applicationId) {
        return applicationService.approveApplication(applicationId, principal.getUserId());
    }

    @PutMapping("/{applicationId}/reject")
    public Application rejectApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long applicationId,
            @RequestParam(required = false) String reason) {
        return applicationService.rejectApplication(applicationId, principal.getUserId(), reason);
    }

    @GetMapping
    public ResponseEntity<List<Application>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplication(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplication(id));
    }
}
