-- V4__add_opportunity_to_students.sql
ALTER TABLE students 
ADD COLUMN opportunity_id BIGINT REFERENCES opportunities(opportunity_id);

CREATE INDEX idx_students_opportunity_id ON students(opportunity_id);
