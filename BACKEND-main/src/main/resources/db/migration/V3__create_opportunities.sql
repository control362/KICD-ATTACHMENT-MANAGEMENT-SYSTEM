-- V3__create_opportunities.sql
-- Drop the unused jobs table
DROP TABLE IF EXISTS jobs;

-- Create opportunities table
CREATE TABLE opportunities (
    opportunity_id          BIGSERIAL PRIMARY KEY,
    title                   VARCHAR(255) NOT NULL,
    department_id           BIGINT NOT NULL REFERENCES departments(department_id),
    description             TEXT NOT NULL,
    requirements            TEXT,
    number_of_slots         INTEGER NOT NULL,
    application_deadline    DATE NOT NULL,
    status                  VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_department_id ON opportunities(department_id);
