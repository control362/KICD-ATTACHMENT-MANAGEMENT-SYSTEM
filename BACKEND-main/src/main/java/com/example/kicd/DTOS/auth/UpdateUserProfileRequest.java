package com.example.kicd.DTOS.auth;

import lombok.Data;

@Data
public class UpdateUserProfileRequest {
    private String firstName;
    private String lastName;
    private String profilePhotoUrl;
}
