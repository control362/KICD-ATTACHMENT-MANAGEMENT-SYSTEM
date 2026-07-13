package com.example.kicd.serviceInterfaces;

import com.example.kicd.DTOS.opportunity.OpportunityDTO;
import com.example.kicd.DTOS.opportunity.OpportunityRequest;

import java.util.List;

public interface OpportunityService {
    List<OpportunityDTO> getAllOpportunities(String status);
    OpportunityDTO getOpportunityById(Long id);
    OpportunityDTO createOpportunity(OpportunityRequest request);
    OpportunityDTO updateOpportunity(Long id, OpportunityRequest request);
    void deleteOpportunity(Long id);
}
