-- V5__expand_opportunities_module.sql

-- 1. Modify opportunities table to support new requirements
ALTER TABLE opportunities 
ADD COLUMN reference_number VARCHAR(100) UNIQUE,
ADD COLUMN type VARCHAR(50) DEFAULT 'Internship',
ADD COLUMN benefits TEXT,
ADD COLUMN duration VARCHAR(50),
ADD COLUMN location VARCHAR(150),
ADD COLUMN work_arrangement VARCHAR(50),
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE,
ADD COLUMN featured BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN created_by BIGINT REFERENCES users(user_id);

-- Generate reference numbers for existing opportunities to avoid nulls on unique constraint
UPDATE opportunities SET reference_number = 'OPP-' || opportunity_id WHERE reference_number IS NULL;

-- 2. Create opportunity_documents table
CREATE TABLE opportunity_documents (
    document_id BIGSERIAL PRIMARY KEY,
    opportunity_id BIGINT NOT NULL REFERENCES opportunities(opportunity_id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_opportunity_documents_opp_id ON opportunity_documents(opportunity_id);

-- 3. Create applications table for 1-to-Many student applications
CREATE TABLE applications (
    application_id BIGSERIAL PRIMARY KEY,
    opportunity_id BIGINT NOT NULL REFERENCES opportunities(opportunity_id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(opportunity_id, student_id)
);

CREATE INDEX idx_applications_opp_id ON applications(opportunity_id);
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_status ON applications(status);

-- 4. Migrate existing application data from students table to applications table
-- The students table currently has an opportunity_id and a status.
INSERT INTO applications (opportunity_id, student_id, status, submitted_at, updated_at)
SELECT opportunity_id, student_id, status, created_at, updated_at
FROM students
WHERE opportunity_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Note: We are keeping the legacy opportunity_id and status columns on the students table 
-- temporarily to ensure existing code doesn't break, but they should be deprecated.
