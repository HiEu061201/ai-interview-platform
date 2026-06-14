-- V3__create_chat_messages_table.sql
-- Migration: Create chat_messages table for storing interview conversation history
-- Description: Stores all message exchanges between user and AI with metadata

CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    
    sender VARCHAR(20) NOT NULL,
    message_type VARCHAR(30) NOT NULL,
    turn_no INT NOT NULL,
    
    message_content TEXT NOT NULL,
    model_name VARCHAR(50),
    prompt_tokens INT,
    completion_tokens INT,
    response_time_ms INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_message_session 
        FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
