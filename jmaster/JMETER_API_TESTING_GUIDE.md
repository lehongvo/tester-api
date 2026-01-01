# Hướng Dẫn Test API Transfer trên JMeter

## API Endpoint
```
POST http://localhost:3001/transactions/transfer
```

## Các Bước Tạo Test Plan trong JMeter

### 1. Tạo Thread Group
1. Click chuột phải vào **Test Plan** (bên trái)
2. Chọn: **Add** → **Threads (Users)** → **Thread Group**
3. Cấu hình Thread Group:
   - **Number of Threads (users)**: 1 (hoặc số lượng concurrent users bạn muốn test)
   - **Ramp-Up Period**: 1
   - **Loop Count**: 1 (hoặc số lần muốn lặp lại request)

### 2. Thêm HTTP Request Sampler
1. Click chuột phải vào **Thread Group** vừa tạo
2. Chọn: **Add** → **Sampler** → **HTTP Request**
3. Cấu hình HTTP Request:

#### Basic Tab:
- **Name**: Transfer API Test
- **Protocol**: `http`
- **Server Name or IP**: `localhost`
- **Port Number**: `3001`
- **HTTP Request**: `POST`
- **Path**: `/transactions/transfer`

#### Body Data Tab:
Chuyển sang tab **Body Data** và paste JSON:
```json
{"toUserId":2,"amount":0.01,"description":""}
```

### 3. Thêm HTTP Header Manager
1. Click chuột phải vào **HTTP Request** vừa tạo
2. Chọn: **Add** → **Config Element** → **HTTP Header Manager**
3. Click **Add** để thêm các headers sau:

| Name | Value |
|------|-------|
| `Content-Type` | `application/json` |
| `Accept` | `application/json, text/plain, */*` |
| `Authorization` | `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJzdWIiOjE1LCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc2NzI0MTAyNywiZXhwIjoxNzY3MzI3NDI3fQ.eNm9yGjtgH_o4b5adZvTJxc1NvlNs34yE-hz8FSouWY` |
| `Origin` | `http://localhost:3000` |
| `Referer` | `http://localhost:3000/` |

> **Lưu ý**: Token Bearer có thể hết hạn, bạn cần cập nhật token mới từ ứng dụng của mình.

### 4. Thêm Listeners để Xem Kết Quả
Click chuột phải vào **Thread Group**, chọn **Add** → **Listener**, sau đó thêm:

#### View Results Tree
- **Add** → **Listener** → **View Results Tree**
- Hiển thị chi tiết từng request/response

#### Summary Report
- **Add** → **Listener** → **Summary Report**
- Hiển thị thống kê tổng quan

#### View Results in Table
- **Add** → **Listener** → **View Results in Table**
- Hiển thị kết quả dạng bảng

### 5. Chạy Test
1. Click nút **Save** (Ctrl/Cmd + S) để lưu Test Plan
2. Click nút **Start** (màu xanh lá, hình tam giác) hoặc nhấn **Ctrl/Cmd + R**
3. Xem kết quả trong các Listeners đã thêm

## Cấu Trúc Test Plan Hoàn Chỉnh

```
Test Plan
└── Thread Group
    ├── HTTP Request (Transfer API)
    │   └── HTTP Header Manager
    ├── View Results Tree
    ├── Summary Report
    └── View Results in Table
```

## Test Nâng Cao

### Sử dụng Variables cho Token
1. Thêm **User Defined Variables** vào Test Plan:
   - Click chuột phải **Test Plan** → **Add** → **Config Element** → **User Defined Variables**
   - Thêm variable:
     - Name: `AUTH_TOKEN`
     - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

2. Trong HTTP Header Manager, thay giá trị Authorization bằng:
   ```
   Bearer ${AUTH_TOKEN}
   ```

### Test với Multiple Users
1. Trong Thread Group, tăng **Number of Threads** (ví dụ: 10, 50, 100)
2. Điều chỉnh **Ramp-Up Period** để phân bổ thời gian khởi động users
3. Tăng **Loop Count** để test nhiều lần

### Thêm Assertions
1. Click chuột phải vào **HTTP Request**
2. Chọn: **Add** → **Assertions** → **Response Assertion**
3. Cấu hình:
   - **Response Code**: `200`
   - **Response Message**: (tùy chọn)

## Troubleshooting

### Lỗi Connection Refused
- Đảm bảo backend đang chạy trên `localhost:3001`
- Kiểm tra bằng: `curl http://localhost:3001/health` (nếu có endpoint health check)

### Lỗi 401 Unauthorized
- Token đã hết hạn, cần lấy token mới
- Kiểm tra Authorization header đã đúng format chưa

### Lỗi 400 Bad Request
- Kiểm tra JSON body có đúng format không
- Đảm bảo Content-Type header là `application/json`

## Lưu Test Plan
File test plan sẽ được lưu với extension `.jmx`. Bạn có thể:
- Lưu vào thư mục `jmaster/test-plans/`
- Chia sẻ với team
- Chạy lại bất cứ lúc nào bằng cách: **File** → **Open** → chọn file `.jmx`
