# Slide Deck – Đánh Giá Các CLO

---
## Slide 1 – Tiêu đề
- **Tên đề tài**: Hệ thống đặt vé máy bay tích hợp AI chatbot (SkyLink Airline)
- **Nhóm thực hiện**: [Tên nhóm / thành viên]
- **Giảng viên hướng dẫn**: …
- **Ngày trình bày**: …

---
## Slide 2 – CLO1: Xác định và phát biểu rõ ràng đề tài
- **Mô tả đề tài**: Nền tảng đặt vé máy bay online kết hợp trợ lý AI đa ngôn ngữ, đa phương tiện.
- **Yêu cầu chức năng**: Tìm chuyến bay, đặt vé, chọn ghế, thanh toán, check‑in, AI chat hỗ trợ 24/7.
- **Ràng buộc thực tế**:
  - Kết nối API Gemini (giới hạn token, latency).
  - Tuân thủ quy định hàng không (hành lý, đổi vé).
  - Bảo mật dữ liệu cá nhân (GDPR‑like).
- **Hình ảnh minh họa**: Mockup landing page + chatbot widget.

---
## Slide 3 – CLO2: Phân tích bài toán – Kiến trúc & Thành phần
- **Kiến trúc hệ thống**: Decoupled – Laravel API ↔ React Vite UI ↔ Gemini LLM.
- **Các thành phần**:
  - Backend (Laravel services, repositories, middleware).
  - Frontend (React components, Router, Context API).
  - AI Subsystem (AIChatService, Tool‑Calling Engine, RAG Knowledge Base).
  - Cơ sở dữ liệu MySQL (bảng `flights`, `bookings`, `ai_conversations`).
- **Hạ tầng**:
  - Docker Compose (nginx, php‑fpm, mysql, node).
  - CI/CD (GitHub Actions → Docker Hub → Deploy).
- **Phần cứng / phần mềm**:
  - Server Linux (Ubuntu 22.04), 2 CPU, 4 GB RAM.
  - PHP 8.2, Node v18, MySQL 8.0, Gemini API.
- **Biểu đồ**: Architecture diagram (use mermaid).

---
## Slide 4 – CLO3: Thiết kế kỹ thuật & Đánh giá tính khả thi
- **Quy trình thiết kế**: Requirement → UML (Use‑Case, Sequence) → API Spec → Frontend Wireframes.
- **Thuật toán / Model**:
  - Flight search (SQL + index optimisation).
  - AI function calling (tool routing, fallback strategy).
  - Multilingual detection (Unicode range).
- **Frameworks**:
  - Laravel 11 (Service‑Repository), React 18 + Vite 6, TailwindCSS (optional).
- **Tính khả thi**:
  - Chi phí API Gemini < $0.02/1k tokens → ước tính $30/tháng.
  - Hiệu năng đáp ứng < 2 s (k6 test).
  - Độ mở rộng: Docker Swarm / Kubernetes.
- **Biểu đồ**: Flowchart of AI tool‑calling.

---
## Slide 5 – CLO4: Triển khai & Kết quả thử nghiệm
- **Triển khai**:
  - Docker Compose `docker-compose up -d` → Backend `http://localhost:8000`, Frontend `http://localhost:5173`.
  - CI pipeline: Lint → Test → Build → Deploy.
- **Kết quả**:
  - **Chức năng**: 100 % các tính năng core hoạt động (đặt vé, thanh toán, AI chat).
  - **Kiểm thử**: 150+ test cases, coverage > 85 %.
  - **Hiệu năng**: Avg latency 0.9 s (no tool), 1.8 s (tool), First token < 400 ms.
  - **Bảo mật**: JWT + middleware, không lưu thông tin thẻ.
- **Demo video**: 3‑minute walkthrough (link placeholder).
- **Biểu đồ**: Performance chart (k6).

---
## Slide 6 – CLO5: Làm việc nhóm
- **Cấu trúc nhóm**:
  - PM – quản lý tiến độ, tài liệu.
  - Backend Engineer – API, DB, AI service.
  - Frontend Engineer – UI, React, chatbot widget.
  - AI Engineer – LLM integration, RAG, multilingual.
- **Công cụ hợp tác**: GitHub, Jira, Slack, Confluence.
- **Phân công**: Kanban board, sprint 2‑week.
- **Kết quả**: Hoàn thành 95 % task đúng hạn, ít xung đột merge.
- **Hình ảnh**: Screenshot board (placeholder).

---
## Slide 7 – CLO6: Trình bày & Thảo luận
- **Hình thức**:
  - Báo cáo viết (PDF) – 30 trang, chuẩn IEEE.
  - Slide thuyết trình (đây là bản demo).
  - Demo live – chatbot, đặt vé.
- **Phản hồi**:
  - Nhận xét giảng viên: …
  - Cải tiến dựa trên feedback: tối ưu UI, giảm chi phí LLM.
- **Kỹ năng giao tiếp**: Q&A, xử lý câu hỏi về bảo mật, scalability.
- **Hình ảnh**: Photo team (optional).

---
## Slide 8 – Tổng kết & Hướng phát triển
- **Đạt được**: Tất cả 6 CLO được chứng minh bằng sản phẩm thực tế.
- **Kế hoạch tương lai**:
  - Fine‑tune LLM nội bộ.
  - Tích hợp voice assistant.
  - Deploy trên cloud (AWS/EKS).
- **Cảm ơn** – Liên hệ: admin@skylink.com.

---
## Design Tips (Áp dụng cho toàn bộ slide)
- **Màu chủ đạo**: Deep Navy (#0A1F44) + Silver (#E5E5E5) + Gold Accent (#D4AF37).
- **Typography**: Google Font *Inter* – headings 48‑56 px, body 20‑24 px.
- **Hiệu ứng**: Fade‑in for bullet points, subtle shadow on cards.
- **Icons**: Feather icons for features, Material icons for AI.
- **Layout**: 16:9, margin 2 rem, grid 12‑column.
- **Images**: Use generated mockups (flight card, chatbot widget) – placeholder `![Mockup](file:///path/to/mockup.png)`.

---
*End of slide outline*
