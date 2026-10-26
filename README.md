# Nhà AI

Web app tạo tám ảnh bất động sản theo phong cách và mức độ mới/cũ của ảnh tham chiếu. Giao diện tiếng Việt, thiết kế responsive, dùng API tạo ảnh ở phía máy chủ để không lộ API key.

## Chạy và chia sẻ

1. Đưa thư mục này lên một repository GitHub.
2. Tạo project trên Vercel, chọn repository đó làm nguồn triển khai.
3. Trong Vercel, đặt biến môi trường `OPENAI_API_KEY` bằng API key của tài khoản OpenAI Platform có bật thanh toán API. Không đặt key trong mã trình duyệt.
4. Deploy. Đường dẫn Vercel tạo ra có thể gửi cho mọi người mở và sử dụng.

Trang tĩnh nằm ở `index.html`; endpoint xử lý ảnh nằm ở `api/generate.js`. Mỗi bộ ảnh tạo tám lượt gọi chỉnh sửa ảnh tham chiếu nên sẽ phát sinh chi phí API theo tài khoản sở hữu key. Trước khi chia sẻ công khai rộng rãi, nên thêm giới hạn lượt sử dụng hoặc đăng nhập để kiểm soát chi phí.

Các phòng không có trong ảnh tham chiếu được tạo như ảnh minh họa cùng phong cách. Không nên dùng các ảnh đó để khẳng định hiện trạng thực tế.

