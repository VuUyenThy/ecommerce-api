# E-commerce API

REST API dùng Node.js, Express, Prisma, PostgreSQL và Docker Compose.

## Yêu cầu

- Docker Desktop đang chạy (Windows/macOS) hoặc Docker Engine và Compose plugin (Linux).
- Postman để gọi thử API.

Không cần cài Node.js hoặc PostgreSQL trên máy nếu chỉ chạy bằng Docker.

## Chạy lần đầu

Mở terminal tại thư mục dự án. Tạo file cấu hình từ mẫu:

```bash
cp .env.example .env
```

Trên Windows Command Prompt có thể dùng `copy .env.example .env`. Mở `.env`, thay `JWT_SECRET=change-me` bằng một chuỗi bí mật riêng trước khi dùng.

Khởi động PostgreSQL và API:

```bash
docker compose up -d --build
```

Compose sẽ dựng PostgreSQL và API; container API tự áp dụng Prisma migrations khi khởi động. Tạo role, membership và tài khoản admin mẫu bằng seed:

```bash
docker compose exec api node prisma/seed.js
```

Kiểm tra API: mở `http://localhost:3000/health`; kết quả mong đợi có `"status":"ok"` và `"database":"up"`.

Tài khoản mẫu để học: `admin` / `admin123`.

## Thử luồng đăng ký và đăng nhập

Trong Postman, chọn **Body → raw → JSON**.

Đăng ký, `POST http://localhost:3000/api/auth/register`:

```json
{
  "fullname": "Demo User",
  "username": "demo01",
  "password": "Pass123456"
}
```

Đăng nhập, `POST http://localhost:3000/api/auth/login`, với body:

```json
{
  "username": "demo01",
  "password": "Pass123456"
}
```

Sao chép `token` từ phản hồi. Với các endpoint cần đăng nhập, chọn **Authorization → Bearer Token** và dán token vào ô Token.

## Các endpoint chính

| Method | Đường dẫn | Quyền |
|---|---|---|
| GET | `/health` | Công khai |
| POST | `/api/auth/register`, `/api/auth/login` | Công khai |
| GET | `/api/auth/me` | Đăng nhập |
| GET | `/api/products`, `/api/products/:id` | Công khai |
| POST, PUT, DELETE | `/api/products` | ADMIN |
| POST, GET | `/api/orders`, `/api/orders/:id` | Đăng nhập |
| GET | `/api/shipments/:id` | Chủ đơn hoặc ADMIN |
| PATCH | `/api/shipments/:id` | ADMIN |

Tạo order bằng `POST /api/orders` với token và body dạng:

```json
{
  "items": [
    { "pid": 1, "qty": 2 },
    { "pid": 2, "qty": 5 }
  ]
}
```

Lấy `pid` thực tế từ `GET /api/products`. Order thành công sẽ trừ tồn kho và tạo shipment ở trạng thái `PENDING`.

## PostgreSQL và dừng ứng dụng

Mở PostgreSQL CLI:

```bash
docker compose exec db psql -U postgres -d ecommerce
```

Trong `psql`, bảng sản phẩm có tên thường `products` (không phải `"Product"`). Dùng `\dt` để liệt kê bảng và `\q` để thoát.

Dừng container, giữ nguyên dữ liệu database:

```bash
docker compose down
```

Database được lưu trong volume Docker `pgdata`, nên vẫn còn sau khi dừng container.

## Chia sẻ dự án

Gửi toàn bộ mã nguồn cùng `Dockerfile`, `docker-compose.yml`, thư mục `prisma` (bao gồm migrations và seed), `package.json` và `package-lock.json`. Không gửi file `.env` vì file này chứa cấu hình bí mật; người nhận tự tạo từ `.env.example`. Không cần gửi `node_modules` hoặc thư mục `.git`.
