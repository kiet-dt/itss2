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
