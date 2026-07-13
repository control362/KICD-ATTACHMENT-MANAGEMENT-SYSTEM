package com.example.kicd.serviceImplimentations;

import com.example.kicd.DTOS.DepartmentDTO;
import com.example.kicd.entities.Department;
import com.example.kicd.exceptions.ResourceNotFoundException;
import com.example.kicd.repositories.DepartmentRepository;
import com.example.kicd.serviceInterfaces.DepartmentService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentServiceImpl
        implements DepartmentService {

    private final DepartmentRepository
            departmentRepository;

    public DepartmentServiceImpl(
            DepartmentRepository departmentRepository) {

        this.departmentRepository =
                departmentRepository;
    }

    @Override
    public Department createDepartment(
            DepartmentDTO dto) {

        Department department =
                Department.builder()
                        .name(dto.getName())
                        .code(dto.getCode())
                        .build();

        return departmentRepository.save(department);
    }

    @Override
    public Department getDepartment(Long id) {

        return departmentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found"));
    }

    @Override
    public List<Department> getAllDepartments() {

        return departmentRepository.findAll();
    }

    @Override
    public Department updateDepartment(
            Long id,
            DepartmentDTO dto) {

        Department department =
                getDepartment(id);

        department.setName(dto.getName());
        department.setCode(dto.getCode());

        return departmentRepository.save(department);
    }

    @Override
    public void deleteDepartment(Long id) {

        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found");
        }
        departmentRepository.deleteById(id);
    }
}
