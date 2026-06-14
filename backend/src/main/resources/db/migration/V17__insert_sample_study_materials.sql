INSERT INTO study_categories (name, slug, description, display_order) VALUES
('Backend Developer', 'backend-developer', 'Tài liệu ôn tập cho Backend Developer (Java, Spring, System Design)', 1),
('Frontend Developer', 'frontend-developer', 'Tài liệu ôn tập cho Frontend Developer (React, Javascript, CSS)', 2),
('Soft Skills', 'soft-skills', 'Kỹ năng mềm, đàm phán lương và ứng xử tình huống', 3);

SET @backend_id = (SELECT id FROM study_categories WHERE slug = 'backend-developer');
SET @frontend_id = (SELECT id FROM study_categories WHERE slug = 'frontend-developer');
SET @soft_id = (SELECT id FROM study_categories WHERE slug = 'soft-skills');

INSERT INTO study_materials (category_id, title, slug, content, display_order) VALUES
(@backend_id, 'Java Core & OOP', 'java-core-oop', '# 1. Java Core & OOP

## Các khái niệm cơ bản
- **Encapsulation (Đóng gói)**: Che giấu thông tin nội bộ của đối tượng.
- **Inheritance (Kế thừa)**: Chia sẻ hành vi từ class cha xuống class con.
- **Polymorphism (Đa hình)**: Một interface, nhiều implements. Tính đa hình giúp code linh hoạt hơn (Overriding, Overloading).
- **Abstraction (Trừu tượng)**: Tập trung vào "đối tượng làm gì" thay vì "làm như thế nào".

## Phân biệt Abstract Class và Interface
- **Abstract Class**: Dùng khi các class con có mối quan hệ IS-A thực sự, chia sẻ code chung.
- **Interface**: Dùng khi muốn định nghĩa một khả năng (CAN-DO) cho nhiều class không liên quan đến nhau. (Từ Java 8 có default methods).', 1),

(@backend_id, 'Spring Boot & Spring MVC', 'spring-boot-mvc', '# 2. Spring Boot & MVC

## Spring Boot là gì?
- Là framework giúp xây dựng các ứng dụng Spring nhanh chóng bằng cách auto-configuration.
- Tích hợp sẵn Tomcat/Undertow, không cần deploy ra server ngoài.

## Luồng đi của 1 request trong Spring MVC
1. Client gửi request -> `DispatcherServlet` nhận.
2. `DispatcherServlet` hỏi `HandlerMapping` xem request thuộc về Controller nào.
3. Controller xử lý (thường gọi sang Service layer).
4. Controller trả về dữ liệu (REST API thì trả về JSON) hoặc View Name.
5. Nếu trả View Name, `ViewResolver` sẽ tìm file HTML tương ứng và render.', 2),

(@frontend_id, 'React Hooks', 'react-hooks', '# 1. React Hooks

## Các Hook phổ biến
1. **useState**: Quản lý trạng thái cục bộ của component.
2. **useEffect**: Xử lý các side effects (call API, DOM manipulation, subscriptions). Nhớ dọn dẹp (cleanup) để tránh memory leak.
3. **useMemo / useCallback**: Tối ưu hiệu năng, tránh re-render không cần thiết.
4. **useRef**: Truy cập trực tiếp DOM hoặc lưu trữ giá trị không làm thay đổi vòng đời component.

## Tại sao không dùng Hook trong vòng lặp?
Vì React dựa vào thứ tự gọi Hook để biết state nào thuộc về Hook nào. Nếu để trong vòng lặp/điều kiện, thứ tự gọi Hook sẽ bị sai lệch giữa các lần render.', 1),

(@soft_id, 'Cách giới thiệu bản thân (Tell me about yourself)', 'tell-me-about-yourself', '# 1. Giới thiệu bản thân

Đây là câu hỏi mở đầu 99% các cuộc phỏng vấn. Mục tiêu không phải là kể lại CV, mà là "bán" sự phù hợp của bạn với vị trí.

## Công thức: Quá khứ - Hiện tại - Tương lai
1. **Hiện tại**: Bạn đang làm gì, có kỹ năng cốt lõi nào.
2. **Quá khứ**: Bạn đã đạt được những thành tựu gì nổi bật ở công ty cũ.
3. **Tương lai**: Bạn đang tìm kiếm điều gì và tại sao công ty này lại phù hợp với định hướng đó.

## Ví dụ
"Chào anh/chị, tôi là Nguyễn Văn A, một Backend Developer với 3 năm kinh nghiệm làm việc với Java và Spring Boot. Hiện tại, tôi đang phụ trách xây dựng microservices cho hệ thống thanh toán, giúp giảm 30% độ trễ hệ thống..."', 1);
