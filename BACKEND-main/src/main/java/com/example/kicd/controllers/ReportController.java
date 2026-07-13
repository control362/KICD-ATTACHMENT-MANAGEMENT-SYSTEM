package com.example.kicd.controllers;

import com.example.kicd.serviceInterfaces.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/applicants")
    public ResponseEntity<byte[]> downloadApplicantsReport() {
        String csv = reportService.generateApplicantsReport();
        byte[] output = csv.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"applicants_report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(output);
    }

    @GetMapping("/applications")
    public ResponseEntity<byte[]> downloadApplicationsReport() {
        String csv = reportService.generateApplicationsReport();
        byte[] output = csv.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"applications_report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(output);
    }
}
