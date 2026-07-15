-- Add document tracking fields to the applicant_profiles table
ALTER TABLE applicant_profiles 
ADD COLUMN id_document_url TEXT,
ADD COLUMN resume_url TEXT;
