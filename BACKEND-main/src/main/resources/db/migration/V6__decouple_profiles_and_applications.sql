-- V6__decouple_profiles_and_applications.sql

-- 1. Rename students table to applicant_profiles
ALTER TABLE students RENAME TO applicant_profiles;
ALTER SEQUENCE IF EXISTS students_student_id_seq RENAME TO applicant_profiles_student_id_seq;

-- 2. Add approval fields and document links to applications table
ALTER TABLE applications
ADD COLUMN approved_by BIGINT REFERENCES users(user_id),
ADD COLUMN approval_date TIMESTAMPTZ,
ADD COLUMN resume_url TEXT,
ADD COLUMN id_document_url TEXT;

-- Migrate existing approval data and documents from applicant_profiles (formerly students)
UPDATE applications a
SET approved_by = p.approved_by,
    approval_date = p.approval_date,
    resume_url = p.resume_url,
    id_document_url = p.id_document_url
FROM applicant_profiles p
WHERE a.student_id = p.student_id AND p.opportunity_id = a.opportunity_id;

-- 3. Drop legacy application-specific columns from applicant_profiles
ALTER TABLE applicant_profiles
DROP COLUMN IF EXISTS opportunity_id,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS approved_by,
DROP COLUMN IF EXISTS approval_date,
DROP COLUMN IF EXISTS resume_url,
DROP COLUMN IF EXISTS id_document_url;

-- 4. Relax NOT NULL constraints on applicant_profiles to support draft applications
ALTER TABLE applicant_profiles 
ALTER COLUMN admission_number DROP NOT NULL,
ALTER COLUMN first_name DROP NOT NULL,
ALTER COLUMN last_name DROP NOT NULL,
ALTER COLUMN course_name DROP NOT NULL,
ALTER COLUMN university DROP NOT NULL,
ALTER COLUMN year_of_study DROP NOT NULL;

-- 5. Create new tables for documents and custom answers
CREATE TABLE profile_documents (
    document_id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES applicant_profiles(student_id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- CV, ID, TRANSCRIPT, etc.
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE application_documents (
    document_id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES applications(application_id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Note: opportunity_documents already exists from V5.

-- Ensure applications table has draft status handling
-- Existing status constraint is a VARCHAR(50). We can just use "DRAFT" as a new status.
