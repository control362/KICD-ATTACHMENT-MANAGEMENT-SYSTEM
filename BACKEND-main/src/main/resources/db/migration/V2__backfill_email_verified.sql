-- V2__backfill_email_verified.sql
-- The email-verification gate on login was removed (no transactional email
-- provider exists to deliver the link — see AuthServiceImpl#register).
-- Any account created before this change may still have email_verified =
-- false, which would otherwise permanently lock that user out of login now
-- that registration itself no longer flips it to true asynchronously.
UPDATE users
SET email_verified = TRUE,
    email_verification_token = NULL,
    email_token_expires_at = NULL
WHERE email_verified = FALSE;
