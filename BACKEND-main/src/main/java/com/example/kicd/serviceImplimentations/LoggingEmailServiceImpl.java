package com.example.kicd.serviceImplimentations;

import com.example.kicd.serviceInterfaces.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * TEMPORARY implementation. No SMTP/transactional-email provider (SES,
 * SendGrid, Postmark, etc.) was configured in this project, so this logs the
 * link instead of sending real email. This is fine for local development
 * only — replace with a real EmailService bean before any shared/staging
 * deployment, or verification and password reset links will only ever be
 * visible in the server log.
 */
@Service
public class LoggingEmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(LoggingEmailServiceImpl.class);

    @Override
    public void sendVerificationEmail(String toEmail, String token) {
        log.warn("[DEV EMAIL STUB] Verification link for {}: /verify-email?token={}", toEmail, token);
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String token) {
        log.warn("[DEV EMAIL STUB] Password reset link for {}: /reset-password?token={}", toEmail, token);
    }
}
