package com.example.kicd.serviceImplimentations;

import com.example.kicd.DTOS.ApplicantProfileDTO;
import com.example.kicd.entities.Department;
import com.example.kicd.entities.Opportunity;
import com.example.kicd.entities.ApplicantProfile;
import com.example.kicd.entities.User;
import com.example.kicd.enums.ApplicationStatus;
import com.example.kicd.exceptions.ConflictException;
import com.example.kicd.exceptions.ResourceNotFoundException;
import com.example.kicd.repositories.DepartmentRepository;
import com.example.kicd.repositories.OpportunityRepository;
import com.example.kicd.repositories.ApplicantProfileRepository;
import com.example.kicd.repositories.UserRepository;
import com.example.kicd.serviceInterfaces.ApplicantProfileService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicantProfileServiceImpl implements ApplicantProfileService {

    private final ApplicantProfileRepository ApplicantProfileRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final OpportunityRepository opportunityRepository;

    public ApplicantProfileServiceImpl(
            ApplicantProfileRepository ApplicantProfileRepository,
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            OpportunityRepository opportunityRepository) {

        this.ApplicantProfileRepository = ApplicantProfileRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.opportunityRepository = opportunityRepository;
    }

    @Override
    @Transactional
    public ApplicantProfile createApplicantProfile(Long requestingUserId, ApplicantProfileDTO dto) {

        User user = userRepository.findById(requestingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (ApplicantProfileRepository.findByUser_UserId(requestingUserId).isPresent()) {
            throw new ConflictException("You have already submitted an application.");
        }

        Department department = null;
        if (dto.getDepartmentId() != null) {
            department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        }

        ApplicantProfile applicantProfile = ApplicantProfile.builder()
                .user(user)
                .department(department)
                .email(user.getEmail())
                .university(dto.getUniversity())
                .admissionNumber(dto.getAdmissionNumber())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .phoneNumber(dto.getPhoneNumber())
                .dateOfBirth(dto.getDateOfBirth())
                .gender(dto.getGender())
                .courseName(dto.getCourseName())
                .yearOfStudy(dto.getYearOfStudy())
                .gpa(dto.getGpa())
                .bio(dto.getBio())
                .profilePhotoUrl(dto.getProfilePhotoUrl())
                .build();

        applicantProfile.setProfileCompleted(isProfileComplete(applicantProfile));

        return ApplicantProfileRepository.save(applicantProfile);
    }

    @Override
    public ApplicantProfile getApplicantProfile(Long id, Long requestingUserId) {

        ApplicantProfile application = ApplicantProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        assertOwnedByOrStaff(application, requestingUserId);

        return application;
    }

    @Override
    public ApplicantProfile getOwnApplication(Long requestingUserId) {
        return ApplicantProfileRepository.findByUser_UserId(requestingUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "You have not submitted an application yet."));
    }

    @Override
    public List<ApplicantProfile> getAllApplicantProfiles() {
        return ApplicantProfileRepository.findAll();
    }

    @Override
    @Transactional
    public ApplicantProfile updateApplicantProfile(Long id, Long requestingUserId, ApplicantProfileDTO dto) {

        ApplicantProfile applicantProfile = ApplicantProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        assertOwnedByOrStaff(applicantProfile, requestingUserId);

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            applicantProfile.setDepartment(department);
        } else {
            applicantProfile.setDepartment(null);
        }
        applicantProfile.setUniversity(dto.getUniversity());
        applicantProfile.setFirstName(dto.getFirstName());
        applicantProfile.setLastName(dto.getLastName());
        applicantProfile.setPhoneNumber(dto.getPhoneNumber());
        applicantProfile.setDateOfBirth(dto.getDateOfBirth());
        applicantProfile.setGender(dto.getGender());
        applicantProfile.setCourseName(dto.getCourseName());
        applicantProfile.setYearOfStudy(dto.getYearOfStudy());
        applicantProfile.setGpa(dto.getGpa());
        applicantProfile.setBio(dto.getBio());
        applicantProfile.setProfilePhotoUrl(dto.getProfilePhotoUrl());
        if (dto.getAdmissionNumber() != null && !dto.getAdmissionNumber().trim().isEmpty()) {
            ApplicantProfile existingWithAdmissionNo = ApplicantProfileRepository.findByAdmissionNumber(dto.getAdmissionNumber().trim()).orElse(null);
            if (existingWithAdmissionNo != null && !existingWithAdmissionNo.getStudentId().equals(applicantProfile.getStudentId())) {
                throw new ConflictException("The Admission Number '" + dto.getAdmissionNumber() + "' is already registered to another account.");
            }
            applicantProfile.setAdmissionNumber(dto.getAdmissionNumber().trim());
        } else {
            applicantProfile.setAdmissionNumber(null);
        }

        if (applicantProfile.getUser() != null) {
            applicantProfile.setEmail(applicantProfile.getUser().getEmail());
        }

        applicantProfile.setProfileCompleted(isProfileComplete(applicantProfile));

        return ApplicantProfileRepository.save(applicantProfile);
    }

    @Override
    @Transactional
    public void deleteApplicantProfile(Long id) {
        if (!ApplicantProfileRepository.existsById(id)) {
            throw new ResourceNotFoundException("Application not found");
        }
        ApplicantProfileRepository.deleteById(id);
    }

    /**
     * requestingUserId == null means "caller is HR_OFFICER/ADMIN, no ownership
     * restriction".
     */
    private void assertOwnedByOrStaff(ApplicantProfile application, Long requestingUserId) {
        if (requestingUserId == null) {
            return;
        }
        if (application.getUser() == null || !application.getUser().getUserId().equals(requestingUserId)) {
            throw new AccessDeniedException("You do not have permission to access this application.");
        }
    }

    private boolean isProfileComplete(ApplicantProfile student) {
        return student.getFirstName() != null && !student.getFirstName().trim().isEmpty()
                && student.getLastName() != null && !student.getLastName().trim().isEmpty()
                && student.getAdmissionNumber() != null && !student.getAdmissionNumber().trim().isEmpty()
                && student.getDepartment() != null
                && student.getUniversity() != null && !student.getUniversity().trim().isEmpty()
                && student.getCourseName() != null && !student.getCourseName().trim().isEmpty()
                && student.getYearOfStudy() != null
                && student.getPhoneNumber() != null && !student.getPhoneNumber().trim().isEmpty()
                && student.getGpa() != null
                && student.getGender() != null
                && student.getBio() != null && !student.getBio().trim().isEmpty();
    }
}
