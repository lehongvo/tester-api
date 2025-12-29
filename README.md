# Tester API - Student Management System

Hệ thống quản lý sinh viên với Backend NestJS và Frontend Next.js.

## Cấu trúc dự án

```
tester_api/
├── backend/          # NestJS Backend API
├── frontend/         # Next.js Frontend
└── docker-compose.yml
```

## Tính năng

### Backend (NestJS)
- ✅ Authentication: Login/Logout với JWT
- ✅ Student CRUD: Create, Read, Update, Delete
- ✅ PostgreSQL Database
- ✅ Docker support

### Frontend (Next.js)
- ✅ Dashboard quản lý sinh viên
- ✅ Đăng nhập/Đăng xuất
- ✅ Xem danh sách sinh viên
- ✅ Thêm/Sửa/Xóa sinh viên
- ✅ Docker support

## Cài đặt và chạy

### Sử dụng Docker (Khuyến nghị)

1. Chạy toàn bộ hệ thống:
```bash
docker-compose up --build
```

2. Truy cập:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

### Chạy thủ công

#### Backend
```bash
cd backend
npm install
npm run start:dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Database
Đảm bảo PostgreSQL đang chạy với:
- Host: localhost
- Port: 5432
- Username: postgres
- Password: postgres
- Database: tester_db

## Thông tin đăng nhập mặc định

- Username: `admin`
- Password: `admin123`

## API Endpoints

### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/logout` - Đăng xuất (cần JWT token)

### Students
- `GET /students` - Lấy danh sách sinh viên (cần JWT token)
- `GET /students/:id` - Lấy thông tin sinh viên (cần JWT token)
- `POST /students` - Tạo sinh viên mới (cần JWT token)
- `PATCH /students/:id` - Cập nhật sinh viên (cần JWT token)
- `DELETE /students/:id` - Xóa sinh viên (cần JWT token)

## Environment Variables

### Backend
Tạo file `.env` trong thư mục `backend/`:
```
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=tester_db
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

### Frontend
Tạo file `.env.local` trong thư mục `frontend/`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Lưu ý

- Backend tự động tạo user mặc định `admin/admin123` khi khởi động lần đầu
- Database sẽ tự động sync schema khi chạy (synchronize: true) - chỉ dùng cho development
- JWT token được lưu trong localStorage của browser

## Swagger Documentation

Sau khi chạy backend, truy cập Swagger UI tại:
- http://localhost:3001/api

Swagger cung cấp tài liệu API đầy đủ với khả năng test trực tiếp các endpoints.
