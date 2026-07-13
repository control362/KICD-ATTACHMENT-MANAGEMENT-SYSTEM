package com.example.kicd.DTOS;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Used only by the Admin-only /api/users management endpoints (creating and
 * editing STAFF accounts). Self-service student registration goes through
 * AuthController/RegisterRequest instead, which never accepts a roleId from
 * the client (a student cannot grant themselves ADMIN by posting a role id).
 */
@Data
public class UserDTO {

    @NotNull(message = "Role is required")
    private Long roleId;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    // Required on create; optional on update (omit to leave password unchanged).
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    // Optional; only meaningful on update (create always starts active). Null = leave unchanged.
    private Boolean isActive;
}
