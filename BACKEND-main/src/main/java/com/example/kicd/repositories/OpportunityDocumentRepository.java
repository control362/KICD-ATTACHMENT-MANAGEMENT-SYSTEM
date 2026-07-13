package com.example.kicd.repositories;

import com.example.kicd.entities.OpportunityDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpportunityDocumentRepository extends JpaRepository<OpportunityDocument, Long> {
    List<OpportunityDocument> findByOpportunityOpportunityId(Long opportunityId);
}
