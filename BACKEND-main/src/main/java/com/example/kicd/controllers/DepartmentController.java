package com.example.kicd.controllers;

import com.example.kicd.DTOS.DepartmentDTO;
import com.example.kicd.entities.Department;
import com.example.kicd.serviceInterfaces.DepartmentService;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService
            departmentService;

    public DepartmentController(
            DepartmentService departmentService) {

        this.departmentService =
                departmentService;
    }

    @PostMapping
    public ResponseEntity<Department>
    createDepartment(
            @Valid @RequestBody DepartmentDTO dto) {

        return ResponseEntity.ok(
                departmentService
                        .createDepartment(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Department>
    getDepartment(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                departmentService
                        .getDepartment(id));
    }

    @GetMapping
    public ResponseEntity<List<Department>>
    getAllDepartments() {

        return ResponseEntity.ok(
                departmentService
                        .getAllDepartments());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Department>
    updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentDTO dto) {

        return ResponseEntity.ok(
                departmentService
                        .updateDepartment(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteDepartment(
            @PathVariable Long id) {

        departmentService.deleteDepartment(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}
