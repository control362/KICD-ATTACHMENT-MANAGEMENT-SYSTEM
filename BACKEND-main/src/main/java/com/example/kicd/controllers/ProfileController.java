package com.example.kicd.controllers;

import com.example.kicd.DTOS.ApplicantProfileDTO;
import com.example.kicd.entities.ApplicantProfile;
import com.example.kicd.security.UserPrincipal;
import com.example.kicd.serviceInterfaces.ApplicantProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ApplicantProfileService ApplicantProfileService;

    public ProfileController(ApplicantProfileService ApplicantProfileService) {
        this.ApplicantProfileService = ApplicantProfileService;
    }

    // =========================
    // CREATE — always creates the application for the CALLER, never for an id in the body.
    // =========================
    @PostMapping
    public ResponseEntity<ApplicantProfile> createApplicantProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ApplicantProfileDTO dto) {

        return ResponseEntity.ok(
                ApplicantProfileService.createApplicantProfile(principal.getUserId(), dto)
        );
    }

    // =========================
    // GET OWN — used by the Student Dashboard, since a student has no other way to know their own id.
    // =========================
    @GetMapping("/me")
    public ResponseEntity<ApplicantProfile> getOwnApplication(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApplicantProfileService.getOwnApplication(principal.getUserId()));
    }

    // =========================
    // GET ONE — ownership-checked in the service layer for STUDENT callers.
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<ApplicantProfile> getApplicantProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        Long ownershipScope = isStaff(principal) ? null : principal.getUserId();
        return ResponseEntity.ok(ApplicantProfileService.getApplicantProfile(id, ownershipScope));
    }

    // =========================
    // GET ALL — HR_OFFICER/ADMIN only (enforced in SecurityConfig).
    // =========================
    @GetMapping
    public ResponseEntity<List<ApplicantProfile>> getAllApplicantProfiles() {
        return ResponseEntity.ok(ApplicantProfileService.getAllApplicantProfiles());
    }

    // =========================
    // UPDATE — ownership-checked in the service layer for STUDENT callers.
    // =========================
    @PutMapping("/{id}")
    public ResponseEntity<ApplicantProfile> updateApplicantProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ApplicantProfileDTO dto) {

        Long ownershipScope = isStaff(principal) ? null : principal.getUserId();
        return ResponseEntity.ok(ApplicantProfileService.updateApplicantProfile(id, ownershipScope, dto));
    }

    // =========================
    // DELETE — ADMIN only (enforced in SecurityConfig).
    // =========================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplicantProfile(@PathVariable Long id) {
        ApplicantProfileService.deleteApplicantProfile(id);
        return ResponseEntity.noContent().build();
    }


    private boolean isStaff(UserPrincipal principal) {
        return "HR_OFFICER".equals(principal.getRole()) || "ADMIN".equals(principal.getRole());
    }
}
