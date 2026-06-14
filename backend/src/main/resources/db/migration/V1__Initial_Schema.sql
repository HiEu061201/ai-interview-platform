-- V1__create_users_table.sql
-- Migration: Create users table for AI Interview Platform
-- Description: Base users table with authentication fields

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_by INT,
    updated_by INT,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2. Interview Sessions
CREATE TABLE interview_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    position_role VARCHAR(255),
    experience_level VARCHAR(255),
    interview_type VARCHAR(255),
    language VARCHAR(255),
    status VARCHAR(50),
    current_turn INT DEFAULT 0,
    target_turns INT,
    started_at TIMESTAMP NULL,
    ended_at TIMESTAMP NULL,
    duration_seconds INT,
    overall_ai_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_by INT,
    updated_by INT,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Chat Messages
CREATE TABLE chat_messages (
                               id BIGINT AUTO_INCREMENT PRIMARY KEY,
                               session_id BIGINT NOT NULL,

                               sender VARCHAR(20) NOT NULL,        -- USER | AI | SYSTEM
                               message_type VARCHAR(20) NOT NULL,  -- QUESTION | ANSWER | FEEDBACK | SYSTEM
                               turn_no INT NOT NULL DEFAULT 0,

                               message_content TEXT NOT NULL,

                               model_name VARCHAR(50) NULL,
                               prompt_tokens INT NULL,
                               completion_tokens INT NULL,
                               response_time_ms BIGINT NULL,

                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                               CONSTRAINT fk_message_session
                                   FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Answer Evaluations
CREATE TABLE answer_evaluations (
                                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                    message_id BIGINT NOT NULL UNIQUE,

                                    technical_score INT NOT NULL DEFAULT 0,
                                    communication_score INT NOT NULL DEFAULT 0,
                                    clarity_score INT NOT NULL DEFAULT 0,
                                    confidence_score INT NOT NULL DEFAULT 0,
                                    relevance_score INT NOT NULL DEFAULT 0,

                                    strengths TEXT NULL,
                                    weaknesses TEXT NULL,
                                    suggested_improvement TEXT NULL,
                                    detailed_review TEXT NULL,

                                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                    CONSTRAINT fk_eval_message
                                        FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Interview Feedbacks
CREATE TABLE interview_feedbacks (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     session_id BIGINT NOT NULL UNIQUE,

                                     overall_score INT NULL,
                                     technical_score INT NULL,
                                     communication_score INT NULL,
                                     clarity_score INT NULL,
                                     confidence_score INT NULL,

                                     strengths TEXT NULL,
                                     weaknesses TEXT NULL,
                                     detailed_review TEXT NULL,
                                     improvement_plan TEXT NULL,
                                     recommendation_level VARCHAR(30) NULL,

                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                     is_deleted BOOLEAN DEFAULT FALSE,
                                     created_by INT,
                                     updated_by INT,

                                     CONSTRAINT fk_feedback_session
                                         FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB;