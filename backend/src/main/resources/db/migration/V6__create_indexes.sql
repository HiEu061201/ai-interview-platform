-- V6__create_indexes.sql
-- Migration: Create performance indexes for interview_sessions and chat_messages

ALTER TABLE interview_sessions
    ADD INDEX idx_session_user_created (user_id, created_at),
    ADD INDEX idx_session_user_status (user_id, status),
    ADD INDEX idx_session_status (status);

ALTER TABLE chat_messages
    ADD INDEX idx_message_session_time (session_id, created_at),
    ADD INDEX idx_message_session_turn (session_id, turn_no);
