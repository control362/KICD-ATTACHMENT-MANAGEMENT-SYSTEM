-- V1__init_schema.sql
-- Baseline schema for the KICD Attachment Management System.
-- Mirrors the JPA entities exactly so Hibernate ddl-auto=validate passes.

CREATE TABLE roles (
    role_id     BIGSERIAL PRIMARY KEY,
    role_name   VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
    user_id                     BIGSERIAL PRIMARY KEY,
    public_id                   UUID NOT NULL UNIQUE,
    role_id                     BIGINT NOT NULL REFERENCES roles(role_id),
    email                       VARCHAR(255) NOT NULL UNIQUE,
    password_hash               VARCHAR(255) NOT NULL,
    is_active                   BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified              BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token    VARCHAR(255),
    email_token_expires_at      TIMESTAMPTZ,
    failed_login_attempts       INTEGER NOT NULL DEFAULT 0,
    account_locked_until        TIMESTAMPTZ,
    last_login_at               TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_deleted                  BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at                  TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);

CREATE TABLE departments (
    department_id BIGSERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL UNIQUE,
    code          VARCHAR(50)
);

CREATE TABLE students (
    student_id          BIGSERIAL PRIMARY KEY,
    public_id           UUID NOT NULL UNIQUE,
    user_id             BIGINT NOT NULL UNIQUE REFERENCES users(user_id),
    department_id       BIGINT REFERENCES departments(department_id),
    admission_number    VARCHAR(50) NOT NULL UNIQUE,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    phone_number        VARCHAR(20),
    date_of_birth       DATE,
    gender              VARCHAR(20),
    course_name         VARCHAR(150) NOT NULL,
    university          VARCHAR(150) NOT NULL,
    year_of_study       INTEGER NOT NULL,
    gpa                 NUMERIC(3,2),
    bio                 TEXT,
    profile_photo_url   TEXT,
    profile_completed   BOOLEAN NOT NULL DEFAULT FALSE,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_by         BIGINT REFERENCES users(user_id),
    approval_date       TIMESTAMP,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_department_id ON students(department_id);
CREATE INDEX idx_students_user_id ON students(user_id);

CREATE TABLE jobs (
    job_id      BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255),
    description TEXT
);

-- Seed roles referenced throughout the application and frontend spec.
INSERT INTO roles (role_name, description) VALUES
    ('STUDENT', 'Applicant who submits and tracks an attachment application'),
    ('HR_OFFICER', 'Reviewer who evaluates and decides on applications'),
    ('ADMIN', 'Full system administrator: manages staff users and departments');
