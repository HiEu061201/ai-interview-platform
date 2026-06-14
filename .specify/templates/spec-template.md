

# ĐẶC TẢ YÊU CẦU HỆ THỐNG

Trạng thái: DRAFT

---

# 1. Thông tin dự án

Tên dự án:

AI Interview Platform

Mục tiêu:

Cho phép người dùng luyện phỏng vấn với AI.

---

# 2. Đối tượng sử dụng

1. Ứng viên
2. Quản trị viên
3. Gemini AI

---

# 3. User Story

## US-01 Đăng ký

Là một người dùng

Tôi muốn đăng ký tài khoản

Để sử dụng hệ thống.

Điều kiện hoàn thành:

* Username không trùng
* Email không trùng

---

## US-02 Đăng nhập

Là một người dùng

Tôi muốn đăng nhập

Để sử dụng hệ thống.

Điều kiện hoàn thành:

* JWT được cấp thành công

---

## US-03 Tạo buổi phỏng vấn

Là một người dùng

Tôi muốn tạo buổi phỏng vấn

Để luyện tập.

Điều kiện hoàn thành:

* Chọn vị trí
* Chọn kinh nghiệm
* Chọn loại phỏng vấn

---

## US-04 Trả lời câu hỏi

Là một người dùng

Tôi muốn trả lời câu hỏi AI

Để được đánh giá.

Điều kiện hoàn thành:

* AI hỏi
* User trả lời
* AI đánh giá
* AI hỏi tiếp

---

## US-05 Xem báo cáo cuối buổi

Là một người dùng

Tôi muốn nhận báo cáo

Để biết điểm mạnh và điểm yếu.

Điều kiện hoàn thành:

* Có điểm tổng
* Có điểm kỹ thuật
* Có điểm giao tiếp
* Có lộ trình cải thiện

---

# 4. Functional Requirements

FR-01 Đăng ký

FR-02 Đăng nhập

FR-03 JWT Authentication

FR-04 Tạo Interview Session

FR-05 Bắt đầu Interview

FR-06 Gửi câu trả lời

FR-07 AI đánh giá

FR-08 AI hỏi tiếp

FR-09 Sinh Feedback cuối buổi

FR-10 Xem lịch sử phỏng vấn

---

# 5. Non Functional Requirements

NFR-01 Thời gian phản hồi < 5 giây

NFR-02 Bảo mật JWT

NFR-03 Lưu dữ liệu MySQL

NFR-04 Hỗ trợ WebSocket

NFR-05 Có khả năng mở rộng

---

# 6. Database

* users
* interview_sessions
* chat_messages
* answer_evaluations
* interview_feedbacks

---

# 7. Điều kiện hoàn thành

Hệ thống có thể thực hiện trọn vẹn một buổi phỏng vấn từ đầu tới cuối.
