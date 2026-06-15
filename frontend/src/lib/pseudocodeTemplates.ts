export const PSEUDOCODE_TEMPLATES: Record<string, string> = {
  'Tìm max': `// Khung tư duy: Tìm phần tử lớn nhất
1. Khởi tạo max = ?
2. Duyệt từng phần tử trong mảng:
   - Nếu phần tử > max thì cập nhật max
3. Trả về max
// Edge case: mảng rỗng?`,

  'Tìm min': `// Khung tư duy: Tìm phần tử nhỏ nhất
1. Khởi tạo min = ?
2. Duyệt từng phần tử:
   - Nếu phần tử < min thì cập nhật min
3. Trả về min`,

  'Tìm kiếm tuyến tính': `// Khung tư duy: Linear Search
1. Nhận mảng và giá trị cần tìm
2. Duyệt từ đầu đến cuối
3. Nếu tìm thấy → trả về vị trí
4. Không thấy → trả về -1`,

  'Tìm kiếm nhị phân': `// Khung tư duy: Binary Search (mảng đã sắp xếp)
1. left = 0, right = n - 1
2. Trong khi left <= right:
   - mid = (left + right) / 2
   - So sánh arr[mid] với target
   - Điều chỉnh left hoặc right
3. Không tìm thấy → trả về -1`,

  'Sắp xếp': `// Khung tư duy: Sắp xếp
1. Xác định thuật toán phù hợp (bubble/merge/quick?)
2. So sánh và hoán đổi phần tử
3. Lặp đến khi mảng có thứ tự
// Độ phức tạp: O(?)`,

  'Input / Output': `// Input là gì?
- Kiểu dữ liệu:
- Ràng buộc:
- Ví dụ:

// Output là gì?
- Định dạng:
- Ví dụ:`,

  'Kiểm tra điều kiện': `// Khung tư duy: Điều kiện
1. Nếu điều kiện A thì ...
2. Ngược lại nếu điều kiện B thì ...
3. Còn lại ...
// Edge case: null, rỗng, biên`,

  'Duyệt mảng': `// Khung tư duy: Duyệt mảng
1. Với i từ 0 đến n-1:
   - Xử lý arr[i]
2. Có cần duyệt ngược không?`,

  'Duyệt cây': `// Khung tư duy: Duyệt cây
1. Nếu node null → return
2. Xử lý node hiện tại (pre/in/post?)
3. Đệ quy con trái
4. Đệ quy con phải`,

  BFS: `// Khung tư duy: BFS
1. Tạo hàng đợi, thêm node gốc
2. Trong khi hàng đợi không rỗng:
   - Lấy node đầu
   - Xử lý node
   - Thêm các láng giềng chưa thăm`,

  DFS: `// Khung tư duy: DFS
1. Đánh dấu node đã thăm
2. Xử lý node
3. Đệ quy/thăm các láng giềng chưa thăm`,
};

export const ANALYSIS_HINTS = [
  'Input là gì?',
  'Output là gì?',
  'Ràng buộc là gì?',
  'Edge case là gì?',
  'Có những hướng giải quyết nào?',
  'Có thể chia nhỏ bài toán ra sao?',
];
