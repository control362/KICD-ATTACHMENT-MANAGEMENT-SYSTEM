package com.example.kicd.repositories;

import com.example.kicd.entities.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByOpportunityOpportunityId(Long opportunityId);
    List<Application> findByStudentStudentId(Long studentId);
    Optional<Application> findByOpportunityOpportunityIdAndStudentStudentId(Long opportunityId, Long studentId);
    List<Application> findByStatus(String status);
}
