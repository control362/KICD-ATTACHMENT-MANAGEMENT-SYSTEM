package com.example.kicd.repositories;

import com.example.kicd.entities.Opportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {
    List<Opportunity> findByStatusOrderByCreatedAtDesc(String status);
    List<Opportunity> findAllByOrderByCreatedAtDesc();
}
