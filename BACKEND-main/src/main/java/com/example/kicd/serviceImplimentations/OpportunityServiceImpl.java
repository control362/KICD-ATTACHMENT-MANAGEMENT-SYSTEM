package com.example.kicd.serviceImplimentations;

import com.example.kicd.DTOS.opportunity.OpportunityDTO;
import com.example.kicd.DTOS.opportunity.OpportunityRequest;
import com.example.kicd.entities.Department;
import com.example.kicd.entities.Opportunity;
import com.example.kicd.exceptions.ResourceNotFoundException;
import com.example.kicd.repositories.DepartmentRepository;
import com.example.kicd.repositories.OpportunityDocumentRepository;
import com.example.kicd.repositories.OpportunityRepository;
import com.example.kicd.serviceInterfaces.OpportunityService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OpportunityServiceImpl implements OpportunityService {

    private final OpportunityRepository opportunityRepository;
    private final DepartmentRepository departmentRepository;
    private final OpportunityDocumentRepository opportunityDocumentRepository;

    public OpportunityServiceImpl(OpportunityRepository opportunityRepository, 
                                  DepartmentRepository departmentRepository,
                                  OpportunityDocumentRepository opportunityDocumentRepository) {
        this.opportunityRepository = opportunityRepository;
        this.departmentRepository = departmentRepository;
        this.opportunityDocumentRepository = opportunityDocumentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OpportunityDTO> getAllOpportunities(String status) {
        List<Opportunity> ops = (status != null && !status.trim().isEmpty())
                ? opportunityRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase())
                : opportunityRepository.findAllByOrderByCreatedAtDesc();

        return ops.stream().map(OpportunityDTO::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OpportunityDTO getOpportunityById(Long id) {
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found"));
        
        OpportunityDTO dto = OpportunityDTO.fromEntity(opp);
        
        // Fetch documents
        List<com.example.kicd.entities.OpportunityDocument> docs = opportunityDocumentRepository.findByOpportunityOpportunityId(id);
        List<OpportunityDTO.OpportunityDocumentDTO> docDtos = docs.stream().map(d -> 
            OpportunityDTO.OpportunityDocumentDTO.builder()
                .documentId(d.getDocumentId())
                .documentName(d.getDocumentName())
                .isRequired(d.getIsRequired())
                .build()
        ).collect(Collectors.toList());
        dto.setDocuments(docDtos);
        
        return dto;
    }

    @Override
    @Transactional
    public OpportunityDTO createOpportunity(OpportunityRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        Opportunity opp = Opportunity.builder()
                .referenceNumber("OPP-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .title(request.getTitle())
                .type(request.getType())
                .department(department)
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .benefits(request.getBenefits())
                .duration(request.getDuration())
                .location(request.getLocation())
                .workArrangement(request.getWorkArrangement())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .featured(request.getFeatured() != null ? request.getFeatured() : false)
                .imageUrl(request.getImageUrl())
                .numberOfSlots(request.getNumberOfSlots())
                .applicationDeadline(request.getApplicationDeadline())
                .status(request.getStatus().toUpperCase())
                .build();

        Opportunity savedOpp = opportunityRepository.save(opp);

        // Process Documents
        if (request.getDocuments() != null && !request.getDocuments().isEmpty()) {
            List<com.example.kicd.entities.OpportunityDocument> docs = request.getDocuments().stream().map(docReq -> 
                com.example.kicd.entities.OpportunityDocument.builder()
                    .opportunity(savedOpp)
                    .documentName(docReq.getDocumentName())
                    .isRequired(docReq.getIsRequired() != null ? docReq.getIsRequired() : true)
                    .build()
            ).collect(Collectors.toList());
            opportunityDocumentRepository.saveAll(docs);
        }

        return getOpportunityById(savedOpp.getOpportunityId());
    }

    @Override
    @Transactional
    public OpportunityDTO updateOpportunity(Long id, OpportunityRequest request) {
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found"));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        opp.setTitle(request.getTitle());
        opp.setType(request.getType());
        opp.setDepartment(department);
        opp.setDescription(request.getDescription());
        opp.setRequirements(request.getRequirements());
        opp.setBenefits(request.getBenefits());
        opp.setDuration(request.getDuration());
        opp.setLocation(request.getLocation());
        opp.setWorkArrangement(request.getWorkArrangement());
        opp.setStartDate(request.getStartDate());
        opp.setEndDate(request.getEndDate());
        opp.setFeatured(request.getFeatured() != null ? request.getFeatured() : false);
        opp.setImageUrl(request.getImageUrl());
        opp.setNumberOfSlots(request.getNumberOfSlots());
        opp.setApplicationDeadline(request.getApplicationDeadline());
        opp.setStatus(request.getStatus().toUpperCase());

        Opportunity savedOpp = opportunityRepository.save(opp);

        // Update documents: delete old ones and insert new ones
        List<com.example.kicd.entities.OpportunityDocument> existingDocs = opportunityDocumentRepository.findByOpportunityOpportunityId(id);
        opportunityDocumentRepository.deleteAll(existingDocs);

        if (request.getDocuments() != null && !request.getDocuments().isEmpty()) {
            List<com.example.kicd.entities.OpportunityDocument> newDocs = request.getDocuments().stream().map(docReq -> 
                com.example.kicd.entities.OpportunityDocument.builder()
                    .opportunity(savedOpp)
                    .documentName(docReq.getDocumentName())
                    .isRequired(docReq.getIsRequired() != null ? docReq.getIsRequired() : true)
                    .build()
            ).collect(Collectors.toList());
            opportunityDocumentRepository.saveAll(newDocs);
        }

        return getOpportunityById(savedOpp.getOpportunityId());
    }

    @Override
    @Transactional
    public void deleteOpportunity(Long id) {
        if (!opportunityRepository.existsById(id)) {
            throw new ResourceNotFoundException("Opportunity not found");
        }
        opportunityRepository.deleteById(id);
    }
}
