# E-commerce API (MVP, Monolithic)

Node.js, Express, Prisma, PostgreSQL, JWT, Docker Compose.

## Chạy bằng Docker

    cp .env.example .env        # rồi đổi JWT_SECRET thành chuỗi ngẫu nhiên dài
    docker compose up -d --build
    docker compose exec api node prisma/seed.js

Tài khoản mẫu: admin / admin123 (chỉ để học, đổi khi triển khai thật).

## Endpoint

| Phương thức | Đường dẫn | Quyền |
|---|---|---|
| GET | /health | công khai |
| POST | /api/auth/register, /api/auth/login | công khai |
| GET | /api/auth/me | đăng nhập |
| GET | /api/products, /api/products/:id | công khai |
| POST, PUT, DELETE | /api/products | ADMIN |
| POST, GET | /api/orders, /api/orders/:id | đăng nhập (user chỉ thấy đơn của mình) |
| PATCH | /api/shipments/:id | ADMIN |

Gửi token qua header: Authorization: Bearer <token>
