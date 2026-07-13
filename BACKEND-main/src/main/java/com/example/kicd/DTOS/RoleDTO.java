package com.example.kicd.DTOS;

import com.example.kicd.entities.Role;

public record RoleDTO(Long roleId, String roleName, String description) {
    public static RoleDTO from(Role role) {
        return new RoleDTO(role.getRoleId(), role.getRoleName(), role.getDescription());
    }
}
