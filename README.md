# SkyLink Airline Booking System

Đồ án xây dựng hệ thống đặt vé máy bay và quản lý các dịch vụ du lịch bổ trợ theo mô hình web API, với giao diện React và backend Laravel.

## Công nghệ

- Backend: PHP 8.2+, Laravel 12
- Frontend: React 18, Vite 6
- Cơ sở dữ liệu: cấu hình qua `.env` (SQLite/MySQL); bộ test dùng SQLite in-memory

## Chức năng chính

- Tìm chuyến bay, xem sơ đồ ghế và giữ ghế tạm thời.
- Đặt vé cho một hoặc nhiều hành khách, thanh toán, xem mã đặt chỗ và quản lý vé.
- Hủy/đổi chuyến và làm thủ tục trực tuyến.
- Chatbot AI hỗ trợ tìm chuyến bay và trả lời câu hỏi.
- Tìm và đặt khách sạn, trải nghiệm, thuê xe; có khu vực quản lý cho admin.

## Chạy dự án local (Windows PowerShell)

### Backend

Từ thư mục gốc của repository:

```powershell
composer install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
php artisan key:generate
```

Điền cấu hình cơ sở dữ liệu và các khóa dịch vụ cần thiết vào `.env`, sau đó chạy:

```powershell
php artisan migrate --seed
php artisan serve
```

### Frontend

Mở terminal riêng:

```powershell
Set-Location client
npm install
npm run dev
```

## Kiểm thử

Chạy toàn bộ backend tests:

```powershell
php artisan test
```

Chạy riêng kịch bản API đặt vé đầu-cuối:

```powershell
php artisan test --filter=FlightBookingJourneyTest
```

`FlightBookingJourneyTest` kiểm tra luồng API sau:

1. Tìm chuyến bay theo sân bay đi, sân bay đến và ngày bay.
2. Tải sơ đồ ghế và xác nhận ghế ban đầu chưa bị khóa.
3. Giữ ghế bằng tài khoản người dùng.
4. Tạo đơn đặt vé và kiểm tra mã đặt chỗ, thông tin hành khách, ghế và trạng thái chờ thanh toán.
5. Thanh toán qua adapter mô phỏng, rồi xác nhận đơn chuyển sang `paid` và bản ghi thanh toán được lưu.
6. Tải lại chi tiết đặt chỗ và kiểm tra ghế đã được giữ sau thanh toán.

Đây là kiểm thử tích hợp qua HTTP API trong Laravel, không phải kiểm thử trình duyệt tự động. Thanh toán trong test sử dụng adapter mô phỏng, không gọi cổng thanh toán thật.

Kiểm tra frontend:

```powershell
npm run lint --prefix client
npm run build --prefix client
```

## Phạm vi dữ liệu demo

- Chuyến bay mẫu được seed hoặc sinh trong hệ thống; hiện chưa lấy lịch bay, giá và tình trạng ghế trực tiếp từ hãng hàng không.
- Khách sạn, trải nghiệm và xe thuộc catalog nội bộ; hiện chưa kết nối hệ thống đặt chỗ của nhà cung cấp.
- VNPAY và MoMo trong dự án sử dụng adapter mô phỏng. Thanh toán không trừ tiền thật và mã giao dịch không phải giao dịch từ cổng thanh toán.

Các giới hạn trên thuộc phạm vi demo hiện tại; không xem đơn trong hệ thống là xác nhận đặt chỗ với hãng bay hoặc nhà cung cấp bên ngoài.

## Lưu ý bảo mật

- Không commit `.env`, khóa API, mật khẩu hoặc thông tin thanh toán thật.
- Seeder có tài khoản demo; đổi hoặc vô hiệu hóa thông tin mặc định trước khi triển khai ra môi trường dùng chung.
