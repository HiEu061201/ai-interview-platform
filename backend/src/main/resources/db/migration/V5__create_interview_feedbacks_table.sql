-- V5__create_interview_feedbacks_table.sql
-- Migration: Create interview_feedbacks table for storing session feedback
-- Description: Stores comprehensive feedback and scores for each interview session

CREATE TABLE IF NOT EXISTS interview_feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL UNIQUE,
    
    overall_score DECIMAL(5, 2),
    technical_score DECIMAL(5, 2),
    communication_score DECIMAL(5, 2),
    clarity_score DECIMAL(5, 2),
    confidence_score DECIMAL(5, 2),
    
    strengths TEXT,
    weaknesses TEXT,
    detailed_review TEXT,
    improvement_plan TEXT,
    recommendation_level VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_feedback_session 
        FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE,
    
    INDEX idx_feedback_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
