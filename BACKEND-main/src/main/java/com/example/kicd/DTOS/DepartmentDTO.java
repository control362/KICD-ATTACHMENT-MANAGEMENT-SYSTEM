package com.example.kicd.DTOS;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DepartmentDTO {

    @NotBlank(message = "Department name is required")
    private String name;

    private String code;
}
