package com.example.kicd.repositories;

import com.example.kicd.entities.ApplicantProfile;
import com.example.kicd.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicantProfileRepository extends JpaRepository<ApplicantProfile, Long> {

    Optional<ApplicantProfile> findByUser_UserId(Long userId);
    Optional<ApplicantProfile> findByAdmissionNumber(String admissionNumber);
}
