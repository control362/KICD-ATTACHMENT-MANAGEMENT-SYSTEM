package com.example.kicd.DTOS;

import com.example.kicd.enums.Gender;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ApplicantProfileDTO {

    // NOTE: userId is intentionally NOT a field here. Which user an
    // application belongs to is derived from the authenticated JWT
    // (see ApplicantProfileController), never from client input —
    // otherwise a student could submit an application on someone else's
    // behalf just by changing a number in the request body (IDOR).

    private Long departmentId;

    private String university;

    private String admissionNumber;

    private String firstName;

    private String lastName;

    private String phoneNumber;

    private LocalDate dateOfBirth;
    private Gender gender;

    private String courseName;

    private Integer yearOfStudy;

    private String bio;
    private String profilePhotoUrl;
}
