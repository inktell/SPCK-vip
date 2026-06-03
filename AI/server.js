import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
  console.warn("Thiếu GEMINI_API_KEY trong file .env");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(express.json());
app.use(express.static("public"));

app.post("/api/ask", async (req, res) => {
  try {
    const question = (req.body.question || "").trim();
    const conversationHistory = req.body.history || [];

    if (!question) {
      return res.status(400).json({ error: "Vui lòng nhập câu hỏi." });
    }

    // Build conversation context
    let conversationContext = conversationHistory
      .map(msg => `${msg.sender === 'user' ? 'Khách hàng' : 'Trợ lý'}: ${msg.text}`)
      .join('\n');

    const systemPrompt = `Bạn là trợ lý bán hàng thông minh của cửa hàng Giga.
    
Thông tin về Giga:
- Giga là một cửa hàng mua sắm trực tuyến cung cấp các sản phẩm chất lượng
- Nó được thiết kế để cung cấp trải nghiệm mua sắm nhanh chóng và dễ dàng
- Hỗ trợ các tính năng như: giỏ hàng, thanh toán, tài khoản người dùng, quản lý đơn hàng
- Có các nhân viên bán hàng (sellers) và quản trị viên (admin)

Hướng dẫn trả lời:
- Trả lời bằng tiếng Việt rõ ràng, ngắn gọn, thân thiện
- Tập trung vào việc giúp khách hàng với câu hỏi của họ
- Nếu câu hỏi về tính năng Giga, hãy hướng dẫn chi tiết
- Nếu câu hỏi không liên quan, hãy lịch sự từ chối và hỏi cách tôi có thể giúp
- Luôn bắt đầu bằng một lời chào thân thiện (không cần nếu đã có cuộc trò chuyện)
- Sử dụng emoji phù hợp để làm cho phản hồi thú vị hơn`;

    const prompt = `${systemPrompt}

${conversationContext ? `Lịch sử cuộc trò chuyện:\n${conversationContext}\n` : ''}
Khách hàng: ${question}

Trợ lý:`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const answer = response.text?.trim() || "Xin lỗi, tôi không thể xử lý câu hỏi này.";

    res.json({
      answer: answer.replace(/^Trợ lý:\s*/, '').trim(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Gọi Gemini API thất bại. Hãy kiểm tra lại API key và kết nối.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});