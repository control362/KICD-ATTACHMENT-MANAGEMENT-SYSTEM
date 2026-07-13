package com.example.kicd.controllers;

import com.example.kicd.DTOS.RoleDTO;
import com.example.kicd.repositories.RoleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Read-only. Roles are seeded via Flyway (V1__init_schema.sql), not managed
 * through the API — this exists so the frontend's Staff Management role
 * selector (spec C5) can be driven from real data instead of a hardcoded list.
 */
@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleRepository roleRepository;

    public RoleController(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @GetMapping
    public ResponseEntity<List<RoleDTO>> getAllRoles() {
        List<RoleDTO> roles = roleRepository.findAll().stream()
                .map(RoleDTO::from)
                .toList();
        return ResponseEntity.ok(roles);
    }
}
