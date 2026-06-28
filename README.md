# Giga - Trải Nghiệm Mua Sắm Đẳng Cấp & Tinh Tế (Công Nghệ)

Trang web mua sắm các thiết bị công nghệ đỉnh cao (Laptop, Điện thoại, Smart Home) với giao diện Minimalist hiện đại, tích hợp Chatbot AI và kết nối API thực.

## Tính năng

- **Giao diện Minimalist**: Sang trọng, chuẩn thiết kế Bắc Âu (Scandinavian)
- **Tốc độ tối ưu**: Lazy loading, caching, và tối ưu hóa
- **AI Chatbot**: Tích hợp Google Gemini AI hỗ trợ tư vấn tự động
- **Firebase**: Lưu trữ thông tin người dùng, đơn hàng và Authentication
- **Lazada API**: Lấy dữ liệu sản phẩm thực tế qua RapidAPI
- **Responsive**: Tương thích hoàn hảo với mọi thiết bị di động và máy tính

## Cài đặt & Cách chạy dự án

Dự án này sử dụng Node.js làm Backend (Express) để xử lý API, proxy cho Lazada, chạy AI Chatbot và phục vụ (serve) file tĩnh ở thư mục `Client`.

**Các bước chạy:**

1. **Yêu cầu hệ thống:** Bạn cần cài đặt sẵn [Node.js](https://nodejs.org/).
2. **Cài đặt thư viện:**
   Mở terminal (hoặc Command Prompt) tại thư mục `AI` của dự án và chạy lệnh:
   ```bash
   cd AI
   npm install
   ```
3. **Cấu hình môi trường (nếu cần):**
   Đảm bảo file `AI/.env` chứa các API keys cần thiết (Gemini API, RapidAPI, v.v.).
4. **Khởi động Server:**
   ```bash
   node server.js
   ```
5. **Trải nghiệm ứng dụng:**
   Mở trình duyệt và truy cập vào địa chỉ: **`http://localhost:3001`**

## Cấu hình bổ sung

### Firebase
- Cấu hình Firebase đã được thêm vào mã nguồn (`Client/auth.js` / `Client/main.js`).

### Cloudinary (Tuỳ chọn)
- Nếu dùng tính năng upload ảnh, bạn có thể thiết lập Cloudinary API Key.

## Phát triển

- **Frontend:** HTML/CSS/JS thuần không dùng framework để đảm bảo tốc độ nhanh nhất.
- **Backend:** Node.js (Express) xử lý CORS, gọi API trung gian và điều phối logic của Gemini AI.