ALTER TABLE chat_messages
ADD COLUMN suggested_answer TEXT,
ADD COLUMN score_clarity INT,
ADD COLUMN score_technical INT,
ADD COLUMN score_confidence INT;
