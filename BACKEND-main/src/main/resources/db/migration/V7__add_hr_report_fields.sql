ALTER TABLE opportunities
ADD COLUMN monthly_stipend DECIMAL(10,2);

ALTER TABLE applications
ADD COLUMN rejection_reason VARCHAR(255),
ADD COLUMN timesheet_logged_percentage INTEGER,
ADD COLUMN logbook_status VARCHAR(50),
ADD COLUMN compliance_risk VARCHAR(50),
ADD COLUMN overall_score DECIMAL(3,2),
ADD COLUMN punctuality VARCHAR(50),
ADD COLUMN teamwork VARCHAR(50),
ADD COLUMN supervisor_recommendation VARCHAR(100),
ADD COLUMN exit_completion_status VARCHAR(50),
ADD COLUMN conversion_status VARCHAR(50),
ADD COLUMN exit_survey_sentiment DECIMAL(3,2);
