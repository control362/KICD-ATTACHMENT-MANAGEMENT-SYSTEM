-- V9__seed_default_users.sql

-- Insert default Admin
INSERT INTO users (public_id, role_id, email, password_hash, is_active, email_verified, failed_login_attempts, created_at, updated_at, is_deleted)
VALUES (
    gen_random_uuid(),
    (SELECT role_id FROM roles WHERE role_name = 'ADMIN'),
    'admin@kicd.ac.ke',
    '$2b$10$RBFKzC4PINUvz1AbAHS01.IoVt4YcNGwaLIQ4jCzTT80nDUO35/my', -- password123
    true, true, 0, now(), now(), false
);

-- Insert default HR Officer
INSERT INTO users (public_id, role_id, email, password_hash, is_active, email_verified, failed_login_attempts, created_at, updated_at, is_deleted)
VALUES (
    gen_random_uuid(),
    (SELECT role_id FROM roles WHERE role_name = 'HR_OFFICER'),
    'hr@kicd.ac.ke',
    '$2b$10$RBFKzC4PINUvz1AbAHS01.IoVt4YcNGwaLIQ4jCzTT80nDUO35/my', -- password123
    true, true, 0, now(), now(), false
);

-- Insert default Student
INSERT INTO users (public_id, role_id, email, password_hash, is_active, email_verified, failed_login_attempts, created_at, updated_at, is_deleted)
VALUES (
    gen_random_uuid(),
    (SELECT role_id FROM roles WHERE role_name = 'STUDENT'),
    'student@test.com',
    '$2b$10$RBFKzC4PINUvz1AbAHS01.IoVt4YcNGwaLIQ4jCzTT80nDUO35/my', -- password123
    true, true, 0, now(), now(), false
);
