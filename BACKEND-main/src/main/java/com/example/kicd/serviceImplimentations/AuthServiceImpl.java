package com.example.kicd.serviceImplimentations;

import com.example.kicd.DTOS.auth.AuthResponse;
import com.example.kicd.DTOS.auth.ChangePasswordRequest;
import com.example.kicd.DTOS.auth.ForgotPasswordRequest;
import com.example.kicd.DTOS.auth.LoginRequest;
import com.example.kicd.DTOS.auth.RegisterRequest;
import com.example.kicd.DTOS.auth.ResetPasswordRequest;
import com.example.kicd.DTOS.auth.UpdateUserProfileRequest;
import com.example.kicd.entities.Role;
import com.example.kicd.entities.User;
import com.example.kicd.exceptions.ConflictException;
import com.example.kicd.exceptions.ResourceNotFoundException;
import com.example.kicd.exceptions.UnauthorizedException;
import com.example.kicd.repositories.RoleRepository;
import com.example.kicd.repositories.UserRepository;
import com.example.kicd.security.JwtService;
import com.example.kicd.security.UserPrincipal;
import com.example.kicd.serviceInterfaces.AuthService;
import com.example.kicd.serviceInterfaces.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private static final String STUDENT_ROLE = "STUDENT";
    private static final Duration EMAIL_TOKEN_TTL = Duration.ofHours(24);
    private static final Duration RESET_TOKEN_TTL = Duration.ofHours(1);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    private final int maxFailedAttempts;
    private final long lockoutMinutes;

    public AuthServiceImpl(UserRepository userRepository,
                            RoleRepository roleRepository,
                            PasswordEncoder passwordEncoder,
                            JwtService jwtService,
                            EmailService emailService,
                            @Value("${security.lockout.max-attempts:5}") int maxFailedAttempts,
                            @Value("${security.lockout.duration-minutes:15}") long lockoutMinutes) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.maxFailedAttempts = maxFailedAttempts;
        this.lockoutMinutes = lockoutMinutes;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            // Deliberately vague to avoid confirming an email exists via this path;
            // forgot-password is the sanctioned account-enumeration-safe channel.
            throw new ConflictException("An account with this email could not be created.");
        }

        Role studentRole = roleRepository.findByRoleName(STUDENT_ROLE)
                .orElseThrow(() -> new IllegalStateException(
                        "Required role '" + STUDENT_ROLE + "' is not seeded. Run the Flyway migrations."));

        // NOTE: no email verification loop. There is no transactional email
        // provider wired into this project (see EmailService), so gating
        // login on a link that only ever appears in a server log was a dead
        // end for real users. Accounts are created pre-verified and the
        // caller is logged in immediately, same as AuthController#login.
        // If a real email provider gets added later, this is the one place
        // to flip emailVerified back to false and re-issue a token.
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(studentRole)
                .isActive(true)
                .emailVerified(true)
                .failedLoginAttempts(0)
                .build();

        userRepository.save(user);

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal);

        return AuthResponse.of(token, user.getUserId(), user.getEmail(), user.getRole().getRoleName());
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Incorrect email or password."));

        if (user.getAccountLockedUntil() != null && user.getAccountLockedUntil().isAfter(OffsetDateTime.now())) {
            long minutesLeft = Duration.between(OffsetDateTime.now(), user.getAccountLockedUntil()).toMinutes() + 1;
            throw new UnauthorizedException(
                    "This account is temporarily locked due to repeated failed login attempts. " +
                            "Try again in about " + minutesLeft + " minute(s).");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("This account has been deactivated. Contact an administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            registerFailedAttempt(user);
            throw new UnauthorizedException("Incorrect email or password.");
        }

        user.setFailedLoginAttempts(0);
        user.setAccountLockedUntil(null);
        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal);

        return AuthResponse.of(token, user.getUserId(), user.getEmail(), user.getRole().getRoleName());
    }

    private void registerFailedAttempt(User user) {
        int attempts = (user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts()) + 1;
        user.setFailedLoginAttempts(attempts);

        if (attempts >= maxFailedAttempts) {
            user.setAccountLockedUntil(OffsetDateTime.now().plusMinutes(lockoutMinutes));
        }
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired verification link."));

        if (user.getEmailTokenExpiresAt() == null || user.getEmailTokenExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new ResourceNotFoundException("This verification link has expired. Request a new one.");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailTokenExpiresAt(null);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void resendVerificationEmail(String email) {
        userRepository.findByEmail(email.trim().toLowerCase()).ifPresent(user -> {
            if (Boolean.TRUE.equals(user.getEmailVerified())) {
                return;
            }
            String token = UUID.randomUUID().toString();
            user.setEmailVerificationToken(token);
            user.setEmailTokenExpiresAt(OffsetDateTime.now().plus(EMAIL_TOKEN_TTL));
            userRepository.save(user);
            emailService.sendVerificationEmail(user.getEmail(), token);
        });
        // No else branch: whether the email exists is not revealed to the caller.
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail().trim().toLowerCase()).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            // Reusing the email-verification token slot as a generic "single active
            // token" field to avoid a schema change; if simultaneous
            // verify-email + reset-password flows for the same user turn out to be
            // a real scenario, split this into its own column pair.
            user.setEmailVerificationToken(token);
            user.setEmailTokenExpiresAt(OffsetDateTime.now().plus(RESET_TOKEN_TTL));
            userRepository.save(user);
            emailService.sendPasswordResetEmail(user.getEmail(), token);
        });
        // Always appears to succeed to the caller, regardless of whether the email matched.
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmailVerificationToken(request.getToken())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired reset link."));

        if (user.getEmailTokenExpiresAt() == null || user.getEmailTokenExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new ResourceNotFoundException("This reset link has expired. Request a new one.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setEmailVerificationToken(null);
        user.setEmailTokenExpiresAt(null);
        user.setFailedLoginAttempts(0);
        user.setAccountLockedUntil(null);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return Map.of(
                "userId", user.getUserId(),
                "email", user.getEmail(),
                "role", user.getRole().getRoleName(),
                "firstName", user.getFirstName() == null ? "" : user.getFirstName(),
                "lastName", user.getLastName() == null ? "" : user.getLastName(),
                "profilePhotoUrl", user.getProfilePhotoUrl() == null ? "" : user.getProfilePhotoUrl()
        );
    }

    @Override
    @Transactional
    public Map<String, Object> updateUserProfile(Long userId, UpdateUserProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getProfilePhotoUrl() != null) user.setProfilePhotoUrl(request.getProfilePhotoUrl());

        userRepository.save(user);

        return getUserProfile(userId);
    }
}
