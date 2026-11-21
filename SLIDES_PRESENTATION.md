# BÁO CÁO SLIDE THUYẾT TRÌNH ĐỒ ÁN
## ĐỀ TÀI: HỆ THỐNG ĐẶT VÉ MÁY BAY TÍCH HỢP AI CHATBOT

---

### SLIDE 1: TRANG BÌA
* **Tên đề tài:** HỆ THỐNG ĐẶT VÉ MÁY BAY TÍCH HỢP AI CHATBOT
* **Dự án áp dụng:** SkyLink Airline - nền tảng demo đặt vé máy bay và trợ lý AI
* **Giảng viên hướng dẫn:** [Tên Giảng Viên Hướng Dẫn]
* **Sinh viên thực hiện:** [Tên Sinh Viên / Nhóm Sinh Viên]
* **Chuyên ngành:** Công nghệ Thông tin / Kỹ thuật Phần mềm
* **Năm học:** 2026

---

### SLIDE 2: ĐẶT VẤN ĐỀ & LÝ DO CHỌN ĐỀ TÀI
* **Bối cảnh ngành hàng không:** 
  * Nhu cầu di chuyển bằng đường hàng không tăng cao, khối lượng yêu cầu hỗ trợ khách hàng bùng nổ 24/7.
  * Phương thức hỗ trợ truyền thống (Call center, Email) thường gây nghẽn mạng, thời gian phản hồi chậm và chi phí vận hành lớn.
* **Thách thức hiện tại:**
  * Khách hàng gặp khó khăn trong việc tra cứu thông tin chuyến bay, quy định hành lý, chính sách đổi/hoàn vé phức tạp.
  * Trải nghiệm đặt vé trực tuyến còn rải rác, thiếu trợ lý thông minh đồng hành trong quá trình tra cứu.
* **Giải pháp đề xuất:**
  * Xây dựng nền tảng đặt vé mẫu SkyLink và tích hợp chatbot AI sử dụng LLM, function calling và truy xuất kho tri thức để hỗ trợ tra cứu.

---

### SLIDE 3: MỤC TIÊU CỦA ĐỀ TÀI
* **Mục tiêu tổng quát:** Xây dựng prototype nền tảng đặt vé máy bay tích hợp chatbot AI, minh họa các luồng đặt vé và hỗ trợ tra cứu.
* **Mục tiêu cụ thể:**
  1. Phát triển ứng dụng web với backend Laravel 12 và frontend React.
  2. Tích hợp Gemini API (model cấu hình mặc định `gemini-2.0-flash`) với function calling và tìm kiếm tri thức có fallback.
  3. Xây dựng 6 công cụ: tìm chuyến bay, xem chi tiết chuyến, kiểm tra ghế, tra cứu booking, tra cứu sân bay và tìm kiếm tri thức hàng không.
  4. Hỗ trợ gửi ảnh vào hội thoại AI và thử nghiệm nhận diện ngôn ngữ bằng heuristic; chưa đánh giá độ chính xác toàn diện.

---

### SLIDE 4: PHẠM VI VÀ ĐÓNG GÓP CỦA ĐỀ TÀI
* **Phạm vi nghiên cứu & phát triển:**
  * **Nghiệp vụ đặt vé:** Tìm kiếm dữ liệu chuyến bay mẫu, chọn/giữ ghế, tạo booking, thanh toán mô phỏng và check-in trong hệ thống.
  * **Dịch vụ bổ trợ:** Có catalog nội bộ cho khách sạn, trải nghiệm và thuê xe; chưa kết nối nhà cung cấp bên ngoài.
  * **Chatbot AI:** Function calling truy vấn dữ liệu ứng dụng và tìm kiếm tri thức chính sách mẫu qua RAG/fallback.
* **Đóng góp chính:**
  * Tổ chức frontend React và Laravel Web API tách biệt.
  * Có luồng hội thoại JSON và SSE, cùng cơ chế thử lại/fallback khi gọi Gemini gặp lỗi.
  * Minh họa cách kết hợp chatbot với các API nghiệp vụ; chưa phải hệ thống khai thác thương mại thực tế.

---

### SLIDE 5: TỔNG QUAN HỆ THỐNG SKYLINK AIRLINE
* **Kiến trúc hệ thống:** Decoupled Architecture (API First Model).
* **Phân hệ Người dùng (Customer Portal):**
  * Tìm chuyến theo sân bay và ngày trên dữ liệu trong cơ sở dữ liệu; dữ liệu mẫu được seed hoặc sinh trong ứng dụng.
  * Xem sơ đồ ghế, giữ ghế tạm thời, tạo booking và tra cứu mã PNR nội bộ.
  * Chọn một số dịch vụ hàng không bổ trợ như hành lý và suất ăn; dịch vụ du lịch có catalog/luồng đặt riêng.
  * VNPAY/MoMo sử dụng adapter mô phỏng, không kết nối cổng thật và không trừ tiền.
* **Phân hệ Quản trị (Admin Portal):**
  * Có các màn hình/API quản lý chuyến bay, sân bay, booking, người dùng, thanh toán và đơn dịch vụ.
  * Hiển thị các dữ liệu quản trị có trong ứng dụng; không đồng bộ dữ liệu với hãng hàng không.

---

### SLIDE 6: TỔNG QUAN TRỢ LÝ AI TRONG HÀNG KHÔNG (SKYAI ASSISTANT)
* **Định danh Trợ lý AI:** **SkyAI Assistant** - chatbot trong prototype SkyLink.
* **Các đặc tính nổi bật:**
  * Nhận câu hỏi ngôn ngữ tự nhiên và có thể gọi các tool được khai báo để lấy dữ liệu.
  * Tool giúp câu trả lời về chuyến bay/booking dựa trên dữ liệu ứng dụng, nhưng không loại bỏ hoàn toàn khả năng AI trả lời sai.
  * Có thể gửi ảnh cùng nội dung hội thoại tới Gemini; độ chính xác đọc ảnh chưa được đánh giá và không nên dùng giấy tờ cá nhân thật khi demo.
  * Có endpoint SSE để gửi phản hồi theo luồng; độ trễ phụ thuộc vào mạng và nhà cung cấp model.

---

### SLIDE 7: KIẾN TRÚC CÔNG NGHỆ TỔNG THỂ
* **Frontend:**
  * Framework: **React 18** với **Vite 6**.
  * Giao diện sử dụng Tailwind/CSS và các component React.
  * Routing: React Router DOM.
* **Backend:**
  * Framework: **Laravel 12** (PHP 8.2+), với các controller, service và repository ở những phân hệ tương ứng.
  * CSDL cấu hình qua `.env`; môi trường test dùng SQLite in-memory.
* **AI Core Integration:**
  * API Provider: Google Gemini API; model mặc định trong cấu hình là `gemini-2.0-flash` và có thể đổi qua cấu hình.
  * Protocols: HTTP API và Server-Sent Events (SSE).

---

### SLIDE 8: SƠ ĐỒ KIẾN TRÚC PHÂN HỆ AI (AI SUBSYSTEM ARCHITECTURE)
```
+-----------------------------------------------------------------------+
|                           CLIENT (ReactJS UI)                         |
|    [Chat Widget / SSE Stream Reader] <---> [Flight Card Renderer]     |
+-----------------------------------▲-----------------------------------+
                                    | HTTP / SSE Stream
+-----------------------------------▼-----------------------------------+
|                        BACKEND (Laravel 12 API)                       |
|   +---------------------------------------------------------------+   |
|   |                       AIChatService                           |   |
|   +-------------------------------+-------------------------------+   |
|                                   |                                   |
|   +-------------------------------+-------------------------------+   |
|   |                       AIService                               |   |
|   |  - System Prompt Engine       - Gemini API Integration        |   |
|   |  - Multilingual Detector      - Fallback & Retry Handler      |   |
|   +-------------------------------+-------------------------------+   |
|                                   |                                   |
|   +-------------------------------+-------------------------------+   |
|   |                    AI Tool Calling Engine                     |   |
|   |  [SearchFlightTool]      [GetFlightDetailsTool]                |   |
|   |  [CheckSeatAvailability] [GetBookingInfoTool]                  |   |
|   |  [GetAirportInfoTool]    [SearchKnowledgeTool - RAG]           |   |
|   +-------------------------------+-------------------------------+   |
+-----------------------------------▲-----------------------------------+
                                    | SQL / Database Queries
+-----------------------------------▼-----------------------------------+
|             App Database + Qdrant (if configured) / local fallback     |
+-----------------------------------------------------------------------+
```

---

### SLIDE 9: MÔ HÌNH DỮ LIỆU & LƯU TRỮ TRẠNG THÁI AI
* **Thực thể `ai_conversations`:**
  * `id`, `uuid` (Mã phiên hội thoại định danh duy nhất).
  * `user_id` (Khóa ngoại liên kết bảng users nếu người dùng đã đăng nhập).
  * `title` (Tự động trích xuất tiêu đề ngắn từ tin nhắn đầu tiên).
  * `created_at`, `updated_at`.
* **Thực thể `ai_messages`:**
  * `id`, `conversation_id` (Khóa ngoại).
  * `role` (`user`, `assistant`, `tool`).
  * `content` (Nội dung văn bản tin nhắn).
  * `tool_calls` (JSON lưu thông tin hàm được LLM đề xuất gọi).
  * `tool_name`, `tool_arguments`, `tool_result` (Lưu lịch sử kết quả thực thi công cụ).

---

### SLIDE 10: CƠ CHẾ FUNCTION CALLING (TỔNG QUAN 6 TOOLS CORE)
* **Khái niệm:** LLM nhận định yêu cầu và có thể đề xuất gọi tool; backend thực thi tool rồi gửi kết quả lại cho model.
* **Danh sách 6 Tools cốt lõi của SkyAI:**
  1. `search_flight`: Tìm chuyến bay theo tuyến/ngày với các tham số tìm kiếm được hỗ trợ.
  2. `get_flight_details`: Lấy chi tiết chuyến bay từ dữ liệu ứng dụng.
  3. `check_seat_availability`: Kiểm tra tình trạng ghế của chuyến bay.
  4. `get_booking_info`: Tra cứu booking; thông tin được giới hạn theo quyền truy cập người dùng.
  5. `get_airport_info`: Tra cứu sân bay trong dữ liệu ứng dụng.
  6. `search_airline_knowledge`: Tìm kiếm tài liệu chính sách qua dịch vụ RAG và nguồn fallback cục bộ.

---

### SLIDE 11: QUI TRÌNH XỬ LÝ RAG & TRA CỨU KHO KIẾN THỨC (RAG FLOW)
* **Retrieval-Augmented Generation (RAG):**
  * `search_airline_knowledge` gọi dịch vụ tìm kiếm embedding/Qdrant; nếu tìm kiếm này lỗi, hệ thống dùng các tài liệu chính sách mẫu tích hợp sẵn.
* **Quy trình minh họa:**
  1. Người dùng hỏi về hành lý.
  2. Chatbot có thể gọi `search_airline_knowledge`.
  3. Kết quả tìm được được đưa vào ngữ cảnh để Gemini soạn câu trả lời.
  4. Nội dung chính sách hiện là dữ liệu minh họa của đồ án, không đại diện cho quy định chính thức của hãng bay; câu trả lời cần được kiểm chứng.

---

### SLIDE 12: KHẢ NĂNG ĐA NGÔN NGỮ TỰ ĐỘNG (MULTILINGUAL SYSTEM)
* **Cơ chế hiện có:**
  * `detectLanguage()` dùng một số dấu Unicode/diacritics cho Khmer, Trung, Nhật, Hàn, tiếng Việt và từ khóa tiếng Anh; nếu không nhận diện được thì mặc định tiếng Việt.
  * System prompt yêu cầu Gemini trả lời theo ngôn ngữ người dùng.
* **Giới hạn:** Chưa có bộ đánh giá riêng cho từng ngôn ngữ; không cam kết phát hiện hoặc phản hồi chính xác 100%.

---

### SLIDE 13: XỬ LÝ ĐA PHƯƠNG TIỆN (MULTIMODAL IMAGE ANALYSIS)
* **Luồng xử lý ảnh hiện có:**
  1. Frontend gửi ảnh cùng tin nhắn hội thoại.
  2. `AIService` chuyển dữ liệu ảnh và `mimeType` vào request Gemini dạng `inlineData`.
  3. Model có thể phản hồi về nội dung ảnh; dự án chưa có OCR chuyên dụng hay đánh giá độ chính xác trích xuất giấy tờ.
* **Lưu ý khi demo:** Chỉ dùng ảnh giả lập/đã che thông tin; không tải CCCD, hộ chiếu hoặc dữ liệu cá nhân thật.

---

### SLIDE 14: KỸ THUẬT STREAMING SSE & TỐI ƯU TRẢI NGHIỆM CHIẾN LƯỢC UI
* **Công nghệ Server-Sent Events (SSE):**
  * Backend có endpoint stream để gửi nội dung theo từng chunk; thời gian phản hồi thực tế phụ thuộc model, mạng và cấu hình.
* **Chiến lược giao diện thông minh (UI Optimization Rule):**
  * Khi phản hồi có dữ liệu chuyến bay phù hợp, giao diện có thể hiển thị Flight Cards với thông tin từ kết quả tool.
  * Chưa có số liệu benchmark về thời gian xuất hiện token đầu tiên.

---

### SLIDE 15: QUY TRÌNH NGHIỆP VỤ KHÁCH HÀNG (CUSTOMER JOURNEY)
* **Bước 1: Tìm kiếm:** Tìm chuyến bay mẫu theo sân bay và ngày hoặc hỏi SkyAI.
* **Bước 2: Chọn ghế:** Xem sơ đồ, giữ ghế tạm thời và nhập thông tin hành khách.
* **Bước 3: Dịch vụ bổ trợ:** Có thể chọn hành lý/suất ăn trong luồng vé; khách sạn, trải nghiệm, thuê xe được đặt riêng.
* **Bước 4: Đặt và thanh toán:** Tạo booking, mã PNR nội bộ và cập nhật trạng thái qua adapter thanh toán mô phỏng.
* **Bước 5: Check-in:** Thực hiện check-in và tạo boarding pass trong hệ thống; không phải vé/boarding pass do hãng bay phát hành.

---

### SLIDE 16: QUY TRÌNH NGHIỆP VỤ QUẢN TRỊ (ADMIN MANAGEMENT)
* **Các chức năng quản trị hiện có:** Quản lý sân bay, chuyến bay, booking, người dùng, thanh toán và đặt dịch vụ.
* **Dashboard:** Hiển thị các số liệu được tính từ dữ liệu hiện có trong ứng dụng.
* **Giới hạn:** Không đồng bộ lịch bay với hãng; không có tích hợp quản lý tuyến bay/đội bay bên ngoài.

---

### SLIDE 17: THIẾT KẾ GIAO DIỆN PHÂN HỆ KHÁCH HÀNG (REACTJS FRONTEND)
* **Đặc trưng Giao diện:**
  * Giao diện React theo chủ đề hàng không, có các trang tìm chuyến, đặt vé và quản lý.
  * Các trang chính được thiết kế responsive cho màn hình desktop và mobile.
  * Màu sắc và component được tổ chức theo từng phân hệ.

---

### SLIDE 18: THIẾT KẾ GIAO DIỆN CHATBOT TRỢ LÝ AI (SKYAI CHATBOT UI)
* **Cấu trúc Khung Chat:**
  * Widget chat trong giao diện người dùng, có trạng thái xử lý và lịch sử hội thoại.
  * Có thể hiển thị Flight Cards khi nhận dữ liệu chuyến bay từ tool.
  * Có hỗ trợ gửi ảnh; việc nhận diện nội dung phụ thuộc model và chưa được đánh giá như một chức năng OCR.

---

### SLIDE 19: AN TOÀN THÔNG TIN & XỬ LÝ NGOẠI LỆ AI
* **An toàn & Bảo mật:**
  * Một số API đặt vé yêu cầu đăng nhập; phân quyền admin và kiểm tra quyền truy cập booking được xử lý ở backend.
  * Đây chưa phải kiểm toán bảo mật. Không nhập thẻ, mã PIN, CCCD hoặc hộ chiếu thật khi demo; thanh toán hiện là mô phỏng.
* **Chiến lược xử lý ngoại lệ (Fallback & Resilience):**
  * Có retry khi gọi Gemini gặp lỗi mạng/quá tải và có danh sách model dự phòng trong code.
  * Luồng gọi tool được giới hạn số vòng lặp; khi lỗi, hệ thống có thể trả về nội dung fallback.
  * Cấu hình model và hành vi fallback có thể thay đổi theo `.env` và phản hồi của nhà cung cấp.

---

### SLIDE 20: MÔI TRƯỜNG THỬ NGHIỆM & KỊCH BẢN KIỂM THỬ
* **Môi trường thử nghiệm:**
  * Backend yêu cầu PHP 8.2+ và Laravel 12; frontend dùng React/Vite.
  * Cơ sở dữ liệu ứng dụng được cấu hình qua `.env`; automated tests dùng SQLite in-memory.
  * Seeder hiện có 5 sân bay nội địa mẫu; chuyến bay là dữ liệu seed hoặc được sinh trong ứng dụng, không phải lịch bay trực tiếp.
* **Các kịch bản kiểm thử trọng tâm:**
  * Kịch bản 1: API tìm chuyến, xem ghế, giữ ghế, tạo booking và thanh toán mô phỏng.
  * Kịch bản 2: Kiểm tra API dịch vụ du lịch, xác thực dữ liệu, tồn kho và quyền truy cập.
  * Kịch bản 3: Kiểm tra check-in và một số trường hợp AI như streaming/fallback nhận diện ý định.
  * Chưa có automated browser test, benchmark hiệu năng hoặc xác nhận thanh toán với nhà cung cấp thật.

---

### SLIDE 21: KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST RESULTS)

Lần chạy gần nhất trong quá trình hoàn thiện: `php artisan test` — **50 tests passed, 306 assertions**.

| STT | Nhóm kiểm thử | Phạm vi đã kiểm tra | Kết quả |
|---|---|---|---|
| 1 | Đặt vé API đầu-cuối | Tìm chuyến, xem/giữ ghế, tạo booking, thanh toán adapter giả lập, xem booking sau thanh toán | **Đạt** |
| 2 | Dịch vụ du lịch API | Đặt khách sạn/xe/trải nghiệm, kiểm tra dữ liệu, tồn kho và quyền truy cập | **Đạt** |
| 3 | Check-in và AI | Các test dịch vụ check-in, AI streaming, fallback và nhận diện ý định chuyến bay | **Đạt** |

Đây là kết quả backend tests tự động, không chứng minh độ chính xác của mọi câu trả lời AI hoặc việc giao dịch thật với hãng bay/cổng thanh toán.

---

### SLIDE 22: ĐÁNH GIÁ HIỆU NĂNG (CHƯA CÓ BENCHMARK ĐỊNH LƯỢNG)
* Bộ test hiện tại kiểm tra chức năng; chưa đo latency trung bình/P95, thời gian first-token hoặc tool-routing accuracy.
* Không công bố các tỷ lệ phần trăm khi chưa có bộ câu hỏi, số lần chạy và log đo có thể kiểm chứng.
* **Hướng đo tiếp theo:** cố định tập câu hỏi, cấu hình máy/mạng/model; đo latency và tool selection qua nhiều lượt; báo cáo số mẫu và giới hạn phép đo.

---

### SLIDE 23: ĐÁNH GIÁ ƯU ĐIỂM VÀ HẠN CHẾ DỰ ÁN
* **Điểm đạt được:**
  * Có luồng API đặt vé và các phân hệ quản trị/dịch vụ du lịch trong một ứng dụng.
  * Chatbot có function calling, truy xuất dữ liệu ứng dụng, tìm kiếm tri thức và SSE.
  * Có backend tests tự động cho các luồng chính.
* **Hạn chế hiện tại:**
  * Dữ liệu chuyến bay và catalog dịch vụ là dữ liệu mẫu/nội bộ, chưa kết nối nhà cung cấp.
  * Thanh toán dùng adapter mô phỏng; chưa có giao dịch thật.
  * Chưa có benchmark AI, đánh giá đa ngôn ngữ toàn diện hoặc kiểm thử bảo mật độc lập.

---

### SLIDE 24: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN TƯƠNG LAI
* **Kết luận:**
  * Đồ án hiện thực hóa prototype đặt vé và chatbot AI, đồng thời có automated tests cho các luồng backend chính.
  * Dữ liệu và thanh toán vẫn ở phạm vi mô phỏng, chưa sẵn sàng cho giao dịch thương mại.
* **Hướng phát triển tương lai:**
  1. Tích hợp sandbox/API đối tác cho lịch bay, tồn chỗ và dịch vụ du lịch.
  2. Kết nối payment sandbox với callback/webhook và xử lý hoàn/hủy đúng quy trình.
  3. Xây dựng bộ đánh giá định lượng cho tool routing, RAG, đa ngôn ngữ và streaming.
  4. Bổ sung kiểm thử trình duyệt, kiểm thử bảo mật và hoàn thiện tài liệu vận hành.

---

### SLIDE 25: TRANG CẢM ƠN & HỎI ĐÁP (THANK YOU & Q&A)
* **HỆ THỐNG ĐẶT VÉ MÁY BAY TÍCH HỢP AI CHATBOT**
* Xin chân thành cảm ơn Quý Thầy Cô và các bạn đã lắng nghe bài thuyết trình!
* **Trân trọng kính mời Quý Thầy Cô đặt câu hỏi thảo luận.**
* **Liên hệ & Demo:** SkyLink Airline Booking System - SkyAI Assistant.
