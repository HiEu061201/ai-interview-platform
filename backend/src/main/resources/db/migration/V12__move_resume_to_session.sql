-- Add resume_text to interview_sessions
ALTER TABLE interview_sessions ADD COLUMN resume_text LONGTEXT;

-- Remove resume_text from users
ALTER TABLE users DROP COLUMN resume_text;
