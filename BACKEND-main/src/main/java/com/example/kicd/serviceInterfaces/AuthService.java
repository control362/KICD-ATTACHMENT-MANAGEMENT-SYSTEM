package com.example.kicd.serviceInterfaces;

import com.example.kicd.DTOS.auth.AuthResponse;
import com.example.kicd.DTOS.auth.ChangePasswordRequest;
import com.example.kicd.DTOS.auth.ForgotPasswordRequest;
import com.example.kicd.DTOS.auth.LoginRequest;
import com.example.kicd.DTOS.auth.RegisterRequest;
import com.example.kicd.DTOS.auth.ResetPasswordRequest;
import com.example.kicd.DTOS.auth.UpdateUserProfileRequest;

import java.util.Map;

public interface AuthService {

    /** Creates a STUDENT account, pre-verified, and logs the caller in immediately. */
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    void verifyEmail(String token);

    void resendVerificationEmail(String email);

    /** Always succeeds from the caller's perspective, regardless of whether the email exists. */
    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    /** For an already-authenticated user changing their own password (requires the current one). */
    void changePassword(Long userId, ChangePasswordRequest request);

    Map<String, Object> getUserProfile(Long userId);

    Map<String, Object> updateUserProfile(Long userId, UpdateUserProfileRequest request);
}
