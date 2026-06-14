# EPIC 02 - DATABASE

## TASK-004

STATUS: DONE

Tên:
Tạo Flyway Migration V1 - Users

Mục tiêu:
Tạo migration đầu tiên khởi tạo bảng users.

Prerequisites:

* TASK-001
* TASK-002

Output:

src/main/resources/db/migration/V1__create_users_table.sql

Bảng:

users

Columns:

* id
* username
* email
* password_hash
* full_name
* role
* status
* last_login_at
* created_at
* updated_at

Acceptance Criteria:

* Migration chạy thành công
* Tạo đúng cấu trúc bảng users
* username unique
* email unique
* Engine InnoDB
* Charset utf8mb4

Definition Of Done:

* Flyway PASS
* Table Created PASS

---

## TASK-005

STATUS: DONE

Tên:
Tạo Flyway Migration V2 - Interview Sessions

Mục tiêu:
Tạo bảng lưu phiên phỏng vấn.

Prerequisites:

* TASK-004

Output:

src/main/resources/db/migration/V2__create_interview_sessions_table.sql

Bảng:

interview_sessions

Columns:

* id
* user_id
* position_role
* experience_level
* interview_type
* language
* status
* current_turn
* target_turns
* started_at
* ended_at
* duration_seconds
* overall_ai_summary
* created_at
* updated_at

Foreign Key:

user_id -> users.id

Acceptance Criteria:

* Foreign Key hoạt động
* Cascade Delete hoạt động
* Flyway chạy thành công

Definition Of Done:

* Migration PASS
* FK PASS

---

## TASK-006

STATUS: DONE

Tên:
Tạo Flyway Migration V3 - Chat Messages

Mục tiêu:
Tạo bảng lưu lịch sử hội thoại giữa User và AI.

Prerequisites:

* TASK-005

Output:

src/main/resources/db/migration/V3__create_chat_messages_table.sql

Bảng:

chat_messages

Columns:

* id
* session_id
* sender
* message_type
* turn_no
* message_content
* model_name
* prompt_tokens
* completion_tokens
* response_time_ms
* created_at

Foreign Key:

session_id -> interview_sessions.id

Acceptance Criteria:

* Foreign Key hoạt động
* Cascade Delete hoạt động
* Flyway chạy thành công

Definition Of Done:

* Migration PASS
* FK PASS

---

## TASK-007

STATUS: DONE

Tên:
Tạo Flyway Migration V4 - Answer Evaluations

Mục tiêu:
Tạo bảng lưu đánh giá từng câu trả lời.

Prerequisites:

* TASK-006

Output:

src/main/resources/db/migration/V4__create_answer_evaluations_table.sql

Bảng:

answer_evaluations

Columns:

* id
* message_id
* technical_score
* communication_score
* clarity_score
* confidence_score
* relevance_score
* strengths
* weaknesses
* suggested_improvement
* detailed_review
* created_at

Foreign Key:

message_id -> chat_messages.id

Acceptance Criteria:

* message_id unique
* FK hoạt động
* Flyway chạy thành công

Definition Of Done:

* Migration PASS
* Constraint PASS

---

## TASK-008

STATUS: DONE

Tên:
Tạo Flyway Migration V5 - Interview Feedbacks

Mục tiêu:
Tạo bảng lưu feedback cuối buổi phỏng vấn.

Prerequisites:

* TASK-007

Output:

src/main/resources/db/migration/V5__create_interview_feedbacks_table.sql

Bảng:

interview_feedbacks

Columns:

* id
* session_id
* overall_score
* technical_score
* communication_score
* clarity_score
* confidence_score
* strengths
* weaknesses
* detailed_review
* improvement_plan
* recommendation_level
* created_at
* updated_at

Foreign Key:

session_id -> interview_sessions.id

Acceptance Criteria:

* session_id unique
* FK hoạt động
* Flyway chạy thành công

Definition Of Done:

* Migration PASS
* Constraint PASS

---

## TASK-009

STATUS: DONE

Tên:
Tạo Database Indexes

Mục tiêu:
Tối ưu hiệu năng truy vấn cho Interview Platform.

Prerequisites:

* TASK-008

Output:

Migration:

src/main/resources/db/migration/V6__create_indexes.sql

Indexes:

interview_sessions

* idx_session_user_created
  (user_id, created_at)

* idx_session_user_status
  (user_id, status)

* idx_session_status
  (status)

chat_messages

* idx_message_session_time
  (session_id, created_at)

* idx_message_session_turn
  (session_id, turn_no)

Acceptance Criteria:

* Index được tạo thành công
* Explain Query sử dụng index
* Full Table Scan được giảm thiểu
* Flyway chạy thành công

Definition Of Done:

* Migration PASS
* Index PASS
* Explain Query PASS
