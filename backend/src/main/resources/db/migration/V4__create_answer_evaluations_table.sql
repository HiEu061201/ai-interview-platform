-- V4__create_answer_evaluations_table.sql
-- Migration: Create answer_evaluations table for storing evaluation results
-- Description: Stores detailed evaluation scores and feedback for each user answer

CREATE TABLE IF NOT EXISTS answer_evaluations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT NOT NULL UNIQUE,
    
    technical_score DECIMAL(5, 2),
    communication_score DECIMAL(5, 2),
    clarity_score DECIMAL(5, 2),
    confidence_score DECIMAL(5, 2),
    relevance_score DECIMAL(5, 2),
    
    strengths TEXT,
    weaknesses TEXT,
    suggested_improvement TEXT,
    detailed_review TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_evaluation_message 
        FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    
    INDEX idx_evaluation_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
