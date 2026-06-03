# 🤖 Hướng dẫn Nâng cấp Chatbot Giga

## 📋 Tóm tắt các cải tiến

### ✨ Tính năng mới
1. **Tích hợp Gemini AI** - Chatbot sử dụng Google Gemini API để trả lời thực tế
2. **Typing Indicator** - Hiển thị dấu chỉ báo khi chatbot đang suy nghĩ
3. **Conversation Context** - AI nhớ lịch sử cuộc trò chuyện để trả lời chính xác hơn
4. **Clear History** - Nút xóa lịch sử trò chuyện
5. **Cải thiện UX** - Header mới với mô tả "Trợ lý AI - Hỗ trợ 24/7"
6. **Better Error Handling** - Xử lý lỗi tốt hơn khi server không khả dụng

---

## 🚀 Cách chạy

### Bước 1: Khởi động AI Server

```bash
cd AI
npm install
npm start
```

Server sẽ chạy trên `http://localhost:3000`

### Bước 2: Kiểm tra API Key
- Đảm bảo `GEMINI_API_KEY` đã được thiết lập trong file `AI/.env`
- File `.env` đã chứa API key

### Bước 3: Mở trang web
- Truy cập trang Client (ví dụ: `index.html`)
- Nút chatbot 💬 sẽ xuất hiện ở góc phải dưới

---

## 📝 Các thay đổi chi tiết

### 1. **chatbot.js** - Các cải tiến chính
```javascript
// Thêm API base URL
this.apiBaseUrl = 'http://localhost:3000';

// Tracking waiting state
this.isWaitingForResponse = false;

// Sử dụng AI API thay vì random responses
async getAIResponse(question) { ... }

// Typing indicator
showTypingIndicator() { ... }
removeTypingIndicator() { ... }

// Clear history
clearHistory() { ... }
```

### 2. **server.js** (AI folder) - Cải tiến prompt
- Thêm system prompt chi tiết về Giga store
- Hỗ trợ conversation history cho context
- Sử dụng Gemini 2.0 Flash model
- Xóa prefix "Trợ lý:" từ phản hồi

### 3. **style.css** - CSS mới
```css
/* Typing indicator animation */
.typing-dots { ... }
@keyframes typing { ... }

/* Header actions */
.chatbot-header-actions { ... }
.chatbot-header-btn { ... }
```

---

## 🎯 Cách sử dụng Chatbot

### Người dùng
1. Bấm nút 💬 ở góc phải dưới
2. Nhập câu hỏi (ví dụ: "Làm thế nào để tạo đơn hàng?")
3. AI sẽ trả lời dựa trên kiến thức về Giga
4. Xóa lịch sử: Bấm 🗑️ ở phía trên cùng cửa sổ chat

### Câu hỏi mẫu
- "Làm thế nào để đăng ký tài khoản?"
- "Tôi muốn tìm sản phẩm, phải làm gì?"
- "Làm cách nào để theo dõi đơn hàng của tôi?"
- "Giga chấp nhận những phương thức thanh toán nào?"
- "Tôi muốn trở thành người bán ở Giga"

---

## 🔧 Troubleshooting

### ❌ Chatbot không kết nối được với AI
**Lỗi:** "Kết nối đến server AI không thành công"

**Giải pháp:**
1. Đảm bảo server AI đang chạy: `npm start` trong folder `AI`
2. Kiểm tra port 3000: `lsof -i :3000` (macOS/Linux) hoặc `netstat -ano | findstr :3000` (Windows)
3. Kiểm tra firewall có chặn không

### ❌ Gemini API Error
**Lỗi:** "Gọi Gemini API thất bại"

**Giải pháp:**
1. Kiểm tra `GEMINI_API_KEY` trong `AI/.env`
2. Đảm bảo API key còn hạn
3. Kiểm tra kết nối internet

### ❌ Lịch sử chat không lưu được
**Giải pháp:**
- LocalStorage phải được bật trong trình duyệt
- Kiểm tra Developer Tools > Application > Local Storage

---

## 📊 Cấu trúc API

### POST `/api/ask`
```json
{
  "question": "Làm thế nào để tạo tài khoản?",
  "history": [
    { "text": "Xin chào", "sender": "user" },
    { "text": "Xin chào, tôi có thể giúp gì?", "sender": "bot" }
  ]
}
```

**Response:**
```json
{
  "answer": "Để tạo tài khoản, bạn cần..."
}
```

---

## 🎨 Customization

### Thay đổi System Prompt
Sửa file `AI/server.js`, tìm `systemPrompt`:
```javascript
const systemPrompt = `Bạn là trợ lý bán hàng...`;
```

### Thay đổi Model
Sửa trong `server.js`:
```javascript
model: "gemini-2.0-flash",  // Thay thành model khác
```

### Thay đổi giao diện
Sửa `style.css` hoặc `chatbot.js` để tùy chỉnh màu sắc, kích thước, v.v.

---

## 📚 Danh sách file đã sửa

1. ✅ `Client/chatbot.js` - Tích hợp AI, thêm tính năng mới
2. ✅ `Client/style.css` - Thêm CSS cho typing indicator, header actions
3. ✅ `AI/server.js` - Cải thiện prompt, hỗ trợ history
4. ✅ `Client/index.html`, `login.html`, `signup.html`, `profile.html`, `order.html`, `seller.html`, `address.html`, `admin.html`, `bank.html`, `change-password.html`, `notifications.html` - Thêm import chatbot.js

---

## 💡 Tương lai

### Có thể thêm:
- [ ] Speech-to-Text (ghi âm → text)
- [ ] Text-to-Speech (trả lời bằng giọng nói)
- [ ] Caching responses
- [ ] Analytics (theo dõi câu hỏi phổ biến)
- [ ] Multi-language support
- [ ] Handoff to human support
- [ ] Rate limiting

---

**Được nâng cấp vào:** June 3, 2026
**Tác giả:** GitHub Copilot
