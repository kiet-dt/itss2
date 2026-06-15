# Công cụ hỗ trợ tư duy độc lập

Ứng dụng giúp sinh viên suy nghĩ và lập kế hoạch trước khi dùng AI để code.

## Cấu trúc

- `frontend/` — React + Vite
- `backend/` — Express + SQLite

## Cấu hình Gemini AI (bắt buộc cho AI Analysis)

Tạo file `backend/.env`:

```
GEMINI_API_KEY=your_key_here
```

Lấy API key tại: https://aistudio.google.com/apikey

AI Analysis **chỉ dùng Gemini** — không có fallback local. Thiếu key hoặc lỗi API sẽ báo lỗi rõ ràng.

## Chạy project

```bash
npm install
npm run install:all
npm run dev
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:3001

## Tính năng

- Viết mã giả và sơ đồ tư duy (có timer)
- Lưu/xem/xóa ghi chú
- Phân tích tư duy bằng Gemini AI
- Dashboard thống kê tiến trình

## Deploy (Railway backend + Vercel frontend)

### Railway — backend

1. Root Directory: `backend`
2. Variables: `GEMINI_API_KEY`, `NODE_VERSION=22` (hoặc dùng `backend/railway.toml`)
3. **Volume (bắt buộc để giữ ghi chú):** Service → Volumes → Add Volume → **Mount Path:** `/app/data`
4. `DATA_DIR=/app/data` đã cấu hình sẵn trong `backend/railway.toml`
5. Generate Domain → kiểm tra `https://<domain>/api/health`

Log deploy sẽ in `📁 SQLite: /app/data/app.db` khi volume đúng.

### Vercel — frontend

1. Root Directory: `frontend`
2. **Cách A:** Sửa `frontend/vercel.json` — thay `REPLACE_WITH_YOUR_RAILWAY_DOMAIN` bằng domain Railway (không có `https://`)
3. **Cách B:** Trên Vercel thêm `VITE_API_BASE=https://<domain-railway>/api` (bỏ qua bước sửa vercel.json)
4. Deploy → test Lưu ghi chú và Phân tích AI
