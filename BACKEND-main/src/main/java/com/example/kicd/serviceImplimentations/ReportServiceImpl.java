package com.example.kicd.serviceImplimentations;

import com.example.kicd.entities.ApplicantProfile;
import com.example.kicd.entities.Application;
import com.example.kicd.repositories.ApplicantProfileRepository;
import com.example.kicd.repositories.ApplicationRepository;
import com.example.kicd.serviceInterfaces.ReportService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportServiceImpl implements ReportService {

    private final ApplicantProfileRepository applicantProfileRepository;
    private final ApplicationRepository applicationRepository;

    public ReportServiceImpl(ApplicantProfileRepository applicantProfileRepository, ApplicationRepository applicationRepository) {
        this.applicantProfileRepository = applicantProfileRepository;
        this.applicationRepository = applicationRepository;
    }

    @Override
    public String generateApplicantsReport() {
        List<ApplicantProfile> profiles = applicantProfileRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("Student ID,First Name,Last Name,Email,Phone,University,Course,GPA,Admission Number,Profile Completed\n");

        for (ApplicantProfile profile : profiles) {
            csv.append(escapeCsv(profile.getStudentId() != null ? profile.getStudentId().toString() : "")).append(",");
            csv.append(escapeCsv(profile.getFirstName())).append(",");
            csv.append(escapeCsv(profile.getLastName())).append(",");
            csv.append(escapeCsv(profile.getEmail())).append(",");
            csv.append(escapeCsv(profile.getPhoneNumber())).append(",");
            csv.append(escapeCsv(profile.getUniversity())).append(",");
            csv.append(escapeCsv(profile.getCourseName())).append(",");
            csv.append(escapeCsv(profile.getGpa() != null ? profile.getGpa().toString() : "")).append(",");
            csv.append(escapeCsv(profile.getAdmissionNumber())).append(",");
            csv.append(profile.getProfileCompleted() != null && profile.getProfileCompleted() ? "Yes" : "No").append("\n");
        }
        return csv.toString();
    }

    @Override
    public String generateApplicationsReport() {
        List<Application> applications = applicationRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("Application ID,Applicant Name,Opportunity Title,Department,Status,Submission Date,Decision Date\n");

        for (Application app : applications) {
            String applicantName = (app.getStudent() != null && app.getStudent().getFirstName() != null) 
                    ? app.getStudent().getFirstName() + " " + app.getStudent().getLastName() : "Unknown";
            String opportunityTitle = app.getOpportunity() != null ? app.getOpportunity().getTitle() : "Unknown";
            String department = (app.getOpportunity() != null && app.getOpportunity().getDepartment() != null) 
                    ? app.getOpportunity().getDepartment().getName() : "Unknown";

            csv.append(escapeCsv(app.getApplicationId() != null ? app.getApplicationId().toString() : "")).append(",");
            csv.append(escapeCsv(applicantName)).append(",");
            csv.append(escapeCsv(opportunityTitle)).append(",");
            csv.append(escapeCsv(department)).append(",");
            csv.append(escapeCsv(app.getStatus())).append(",");
            csv.append(escapeCsv(app.getSubmittedAt() != null ? app.getSubmittedAt().toString() : "")).append(",");
            csv.append(escapeCsv(app.getApprovalDate() != null ? app.getApprovalDate().toString() : "")).append("\n");
        }
        return csv.toString();
    }

    private String escapeCsv(String data) {
        if (data == null) {
            return "";
        }
        String escapedData = data.replaceAll("\\R", " ");
        if (data.contains(",") || data.contains("\"") || data.contains("'")) {
            escapedData = "\"" + escapedData.replace("\"", "\"\"") + "\"";
        }
        return escapedData;
    }
}
