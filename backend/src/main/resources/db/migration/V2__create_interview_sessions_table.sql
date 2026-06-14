-- V2__create_interview_sessions_table.sql
-- Migration: Create interview_sessions table for interview management
-- Description: Stores all interview sessions with metadata and state

CREATE TABLE IF NOT EXISTS interview_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    
    position_role VARCHAR(100) NOT NULL,
    experience_level VARCHAR(50) NOT NULL,
    interview_type VARCHAR(50) NOT NULL,
    language VARCHAR(20) NOT NULL DEFAULT 'VI',
    
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    current_turn INT NOT NULL DEFAULT 0,
    target_turns INT NOT NULL DEFAULT 8,
    
    started_at TIMESTAMP NULL,
    ended_at TIMESTAMP NULL,
    duration_seconds INT NULL,
    
    overall_ai_summary TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_session_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
