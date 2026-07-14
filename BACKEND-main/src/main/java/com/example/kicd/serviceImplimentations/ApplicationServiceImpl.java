package com.example.kicd.serviceImplimentations;

import com.example.kicd.entities.Application;
import com.example.kicd.entities.Opportunity;
import com.example.kicd.entities.ApplicantProfile;
import com.example.kicd.exceptions.ResourceNotFoundException;
import com.example.kicd.repositories.ApplicationRepository;
import com.example.kicd.repositories.OpportunityRepository;
import com.example.kicd.repositories.ApplicantProfileRepository;
import com.example.kicd.serviceInterfaces.ApplicationService;
import com.example.kicd.repositories.UserRepository;
import com.example.kicd.entities.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final OpportunityRepository opportunityRepository;
    private final ApplicantProfileRepository ApplicantProfileRepository;
    private final UserRepository userRepository;

    public ApplicationServiceImpl(ApplicationRepository applicationRepository,
                                  OpportunityRepository opportunityRepository,
                                  ApplicantProfileRepository ApplicantProfileRepository,
                                  UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.opportunityRepository = opportunityRepository;
        this.ApplicantProfileRepository = ApplicantProfileRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public Application applyForOpportunity(Long userId, Long opportunityId) {
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ApplicantProfile student = ApplicantProfileRepository.findByUser_UserId(userId)
                .orElseGet(() -> {
                    ApplicantProfile newProfile = ApplicantProfile.builder()
                            .user(user)
                            .email(user.getEmail())
                            .profileCompleted(false)
                            .build();
                    return ApplicantProfileRepository.save(newProfile);
                });

        Opportunity opp = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found"));

        if (!"OPEN".equalsIgnoreCase(opp.getStatus()) && !"PUBLISHED".equalsIgnoreCase(opp.getStatus())) {
            throw new IllegalStateException("This opportunity is not currently open for applications.");
        }

        java.util.Optional<Application> existingOpt = applicationRepository.findByOpportunityOpportunityIdAndStudentStudentId(opportunityId, student.getStudentId());
        if (existingOpt.isPresent()) {
            Application existing = existingOpt.get();
            if ("DRAFT".equalsIgnoreCase(existing.getStatus())) {
                return existing;
            } else {
                throw new IllegalStateException("You have already applied for this opportunity.");
            }
        }

        Application application = Application.builder()
                .opportunity(opp)
                .student(student)
                .status("DRAFT")
                .build();

        return applicationRepository.save(application);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Application> getApplicationsForOpportunity(Long opportunityId) {
        return applicationRepository.findByOpportunityOpportunityId(opportunityId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Application> getMyApplications(Long userId) {
        return ApplicantProfileRepository.findByUser_UserId(userId)
                .map(profile -> applicationRepository.findByStudentStudentId(profile.getStudentId()))
                .orElse(java.util.Collections.emptyList());
    }

    @Override
    @Transactional
    public Application updateApplicationStatus(Long applicationId, String status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        application.setStatus(status.toUpperCase());
        return applicationRepository.save(application);
    }

    @Override
    @Transactional
    public Application submitApplication(Long applicationId, String resumeUrl, String idDocumentUrl) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!application.getStudent().getProfileCompleted()) {
            throw new IllegalStateException("You cannot submit an application with an incomplete profile. Please complete your profile first.");
        }

        if (resumeUrl == null || resumeUrl.trim().isEmpty() || idDocumentUrl == null || idDocumentUrl.trim().isEmpty()) {
            throw new IllegalStateException("Both ID document and CV are mandatory to submit the application.");
        }

        application.setStatus("PENDING");
        application.setResumeUrl(resumeUrl);
        application.setIdDocumentUrl(idDocumentUrl);
        return applicationRepository.save(application);
    }

    @Override
    @Transactional
    public void deleteDraftApplication(Long applicationId, Long userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!application.getStudent().getUser().getUserId().equals(userId)) {
            throw new IllegalStateException("You are not authorized to delete this application.");
        }

        if (!"DRAFT".equalsIgnoreCase(application.getStatus())) {
            throw new IllegalStateException("Only draft applications can be cancelled.");
        }

        applicationRepository.delete(application);
    }

    @Override
    public List<Application> getPendingApplications() {
        return applicationRepository.findByStatus("PENDING");
    }

    @Override
    public List<Application> getApprovedApplications() {
        return applicationRepository.findByStatus("APPROVED");
    }

    @Override
    public List<Application> getRejectedApplications() {
        return applicationRepository.findByStatus("REJECTED");
    }

    @Override
    @Transactional
    public Application approveApplication(Long applicationId, Long hrId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));

        application.setStatus("APPROVED");
        application.setApprovedBy(hr);
        application.setApprovalDate(java.time.LocalDateTime.now());

        return applicationRepository.save(application);
    }

    @Override
    @Transactional
    public Application rejectApplication(Long applicationId, Long hrId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));

        application.setStatus("REJECTED");
        application.setApprovedBy(hr);
        application.setApprovalDate(java.time.LocalDateTime.now());

        return applicationRepository.save(application);
    }

    @Override
    @Transactional(readOnly = true)
    public Application getApplication(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }
}
