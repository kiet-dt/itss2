import { AuthenticityChecker } from './AuthenticityChecker';

interface PseudocodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  noteId?: string;
}

export function PseudocodeEditor({ value, onChange, noteId }: PseudocodeEditorProps) {
  return (
    <div className="h-full p-6 flex flex-col">
      <AuthenticityChecker content={value} noteId={noteId} />
      <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Viết mã giả của bạn tại đây...

Ví dụ:
1. Khởi tạo biến và cấu trúc dữ liệu
2. Đọc input từ người dùng
3. Xử lý logic chính:
   - Bước 1: ...
   - Bước 2: ...
4. Xuất kết quả"
          className="w-full h-full p-6 bg-transparent resize-none focus:outline-none"
          style={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6' }}
        />
      </div>
    </div>
  );
}
