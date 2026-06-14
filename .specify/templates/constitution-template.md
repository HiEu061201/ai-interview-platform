
# HIẾN PHÁP DỰ ÁN

Phiên bản: 1.0

---

# 1. Mục tiêu dự án

Xây dựng hệ thống AI Mock Interview sử dụng:

* Backend: Java Spring Boot
* Frontend: ReactJS
* Database: MySQL
* AI Provider: Gemini Pro

Hệ thống cho phép:

* Đăng ký / Đăng nhập
* Tạo buổi phỏng vấn
* AI đặt câu hỏi
* Người dùng trả lời
* AI đánh giá theo thời gian thực
* AI tạo báo cáo cuối buổi
* Lưu toàn bộ lịch sử phỏng vấn

---

# 2. Nguyên tắc kiến trúc

## KT-01

Controller không chứa business logic.

Controller chỉ được phép:

* Nhận request
* Validate request
* Gọi service
* Trả response

---

## KT-02

Toàn bộ logic AI phải nằm trong:

GeminiService

Không được gọi Gemini trực tiếp từ Controller.

---

## KT-03

Mọi truy cập Database phải thông qua Repository.

Không viết SQL trong Controller.

---

## KT-04

Không trả Entity trực tiếp ra API.

Bắt buộc sử dụng DTO.

---

# 3. Nguyên tắc Database

Mọi thay đổi Database phải:

* Có Flyway Migration
* Có rollback script

---

# 4. Nguyên tắc bảo mật

Bắt buộc:

* Spring Security
* JWT Authentication
* BCrypt Password Encoder

Không lưu mật khẩu dạng plain text.

---

# 5. Nguyên tắc AI

Gemini phải trả về JSON có cấu trúc.

Ví dụ:

{
"evaluation": {},
"nextQuestion": "",
"shouldFinish": false
}

Không parse text tự do.

---

# 6. Nguyên tắc chất lượng mã nguồn

Bắt buộc:

* Constructor Injection
* Lombok
* Validation Annotation
* Global Exception Handler
* Unit Test Service Layer

---

# 7. Cổng kiểm duyệt (Review Gate)

Gate 1:

review-spec

Người dùng phải APPROVE.

Nếu REJECT → Dừng toàn bộ quy trình.

---

Gate 2:

review-plan

Người dùng phải APPROVE.

Nếu REJECT → Dừng toàn bộ quy trình.

---

Không được phép chuyển sang bước implement khi chưa qua cả hai Gate.
