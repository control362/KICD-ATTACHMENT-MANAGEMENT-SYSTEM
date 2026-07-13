package com.example.kicd.serviceInterfaces;

import com.example.kicd.entities.Application;
import java.util.List;

public interface ApplicationService {
    Application applyForOpportunity(Long userId, Long opportunityId);
    List<Application> getApplicationsForOpportunity(Long opportunityId);
    List<Application> getMyApplications(Long userId);
    Application updateApplicationStatus(Long applicationId, String status);
    Application submitApplication(Long applicationId, String resumeUrl, String idDocumentUrl);
    void deleteDraftApplication(Long applicationId, Long userId);

    List<Application> getPendingApplications();
    List<Application> getApprovedApplications();
    List<Application> getRejectedApplications();
    Application approveApplication(Long applicationId, Long hrId);
    Application rejectApplication(Long applicationId, Long hrId);
    
    Application getApplication(Long id);
    List<Application> getAllApplications();
}
