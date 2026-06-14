-- Add OAuth2 fields to users table
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) DEFAULT 'LOCAL';
ALTER TABLE users ADD COLUMN provider_id VARCHAR(255);

-- Make password_hash nullable to support OAuth2 users who don't have passwords
ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL;
