package com.example.kicd.serviceInterfaces;

import com.example.kicd.DTOS.DepartmentDTO;
import com.example.kicd.entities.Department;

import java.util.List;

public interface DepartmentService {

    Department createDepartment(DepartmentDTO dto);

    Department getDepartment(Long id);

    List<Department> getAllDepartments();

    Department updateDepartment(Long id,
                                DepartmentDTO dto);

    void deleteDepartment(Long id);
}
