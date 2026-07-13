package com.example.kicd.serviceInterfaces;
import com.example.kicd.DTOS.ApplicantProfileDTO;
import com.example.kicd.entities.ApplicantProfile;

import java.util.List;

public interface ApplicantProfileService {

    /** requestingUserId = the id of the authenticated user creating THEIR OWN application. */
    ApplicantProfile createApplicantProfile(Long requestingUserId, ApplicantProfileDTO dto);

    /**
     * Ownership-checked fetch: STUDENT can only fetch their own record. Pass
     * null for requestingUserId when the caller is HR_OFFICER/ADMIN (no
     * ownership restriction applies to those roles).
     */
    ApplicantProfile getApplicantProfile(Long id, Long requestingUserId);

    ApplicantProfile getOwnApplication(Long requestingUserId);

    List<ApplicantProfile> getAllApplicantProfiles();

    ApplicantProfile updateApplicantProfile(Long id, Long requestingUserId, ApplicantProfileDTO dto);

    void deleteApplicantProfile(Long id);

}
