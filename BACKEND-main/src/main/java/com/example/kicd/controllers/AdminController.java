package com.example.kicd.controllers;

import com.example.kicd.repositories.UserRepository;
import com.example.kicd.repositories.ApplicationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.time.OffsetDateTime;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/metrics")
public class AdminController {

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;

    public AdminController(UserRepository userRepository, ApplicationRepository applicationRepository) {
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserMetrics() {
        List<com.example.kicd.entities.User> allUsers = userRepository.findAll();
        
        long totalUsers = allUsers.size();
        long mfaEnabledCount = allUsers.stream().filter(u -> Boolean.TRUE.equals(u.getMfaEnabled())).count();
        long lockedAccounts = allUsers.stream().filter(u -> u.getAccountLockedUntil() != null && u.getAccountLockedUntil().isAfter(OffsetDateTime.now())).count();
        
        // Dormant users: not logged in for > 30 days
        OffsetDateTime thirtyDaysAgo = OffsetDateTime.now().minusDays(30);
        long dormantUsers = allUsers.stream()
            .filter(u -> u.getLastLoginAt() == null || u.getLastLoginAt().isBefore(thirtyDaysAgo))
            .count();

        Map<String, Long> roleDistribution = allUsers.stream()
            .collect(Collectors.groupingBy(u -> u.getRole().getRoleName(), Collectors.counting()));

        List<Map<String, Object>> usersDetails = allUsers.stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("userId", u.getUserId());
            m.put("email", u.getEmail());
            m.put("role", u.getRole().getRoleName());
            m.put("lastLoginAt", u.getLastLoginAt());
            m.put("mfaEnabled", u.getMfaEnabled());
            m.put("accountLockedUntil", u.getAccountLockedUntil());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalUsers", totalUsers);
        metrics.put("mfaEnabledCount", mfaEnabledCount);
        metrics.put("mfaComplianceRate", totalUsers > 0 ? (mfaEnabledCount * 100 / totalUsers) : 0);
        metrics.put("lockedAccounts", lockedAccounts);
        metrics.put("dormantUsers", dormantUsers);
        metrics.put("roleDistribution", roleDistribution);
        metrics.put("usersDetails", usersDetails);
        
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/storage")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStorageMetrics() {
        List<com.example.kicd.entities.Application> allApps = applicationRepository.findAll();
        List<com.example.kicd.entities.User> allUsers = userRepository.findAll();

        long resumes = allApps.stream().filter(a -> a.getResumeUrl() != null && !a.getResumeUrl().isEmpty()).count();
        long ids = allApps.stream().filter(a -> a.getIdDocumentUrl() != null && !a.getIdDocumentUrl().isEmpty()).count();
        long profilePhotos = allUsers.stream().filter(u -> u.getProfilePhotoUrl() != null && !u.getProfilePhotoUrl().isEmpty()).count();

        long totalFiles = resumes + ids + profilePhotos;
        // Estimate average file size as 1.5MB for documents/photos
        double estimatedStorageMB = totalFiles * 1.5;

        List<Map<String, String>> fileDetails = new java.util.ArrayList<>();
        
        allApps.forEach(a -> {
            if (a.getResumeUrl() != null && !a.getResumeUrl().isEmpty()) {
                Map<String, String> m = new HashMap<>();
                m.put("type", "resume");
                m.put("url", a.getResumeUrl());
                m.put("ownerEmail", a.getStudent() != null && a.getStudent().getUser() != null ? a.getStudent().getUser().getEmail() : "Unknown");
                m.put("timestamp", a.getSubmittedAt() != null ? a.getSubmittedAt().toString() : "");
                fileDetails.add(m);
            }
            if (a.getIdDocumentUrl() != null && !a.getIdDocumentUrl().isEmpty()) {
                Map<String, String> m = new HashMap<>();
                m.put("type", "id");
                m.put("url", a.getIdDocumentUrl());
                m.put("ownerEmail", a.getStudent() != null && a.getStudent().getUser() != null ? a.getStudent().getUser().getEmail() : "Unknown");
                m.put("timestamp", a.getSubmittedAt() != null ? a.getSubmittedAt().toString() : "");
                fileDetails.add(m);
            }
        });
        
        allUsers.forEach(u -> {
            if (u.getProfilePhotoUrl() != null && !u.getProfilePhotoUrl().isEmpty()) {
                Map<String, String> m = new HashMap<>();
                m.put("type", "profile");
                m.put("url", u.getProfilePhotoUrl());
                m.put("ownerEmail", u.getEmail());
                m.put("timestamp", "");
                fileDetails.add(m);
            }
        });

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalFiles", totalFiles);
        metrics.put("estimatedStorageMB", estimatedStorageMB);
        metrics.put("resumesCount", resumes);
        metrics.put("idDocumentsCount", ids);
        metrics.put("profilePhotosCount", profilePhotos);
        metrics.put("fileDetails", fileDetails);

        return ResponseEntity.ok(metrics);
    }
}
