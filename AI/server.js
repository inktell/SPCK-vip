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

    if (!question) {
      return res.status(400).json({ error: "Vui lòng nhập câu hỏi." });
    }

    const prompt = `
Bạn là trợ lý giải đáp bán hàng bằng tiếng Việt.
Trả lời ngắn gọn, rõ ràng, dễ hiểu, phù hợp cho người mua.
Nếu câu hỏi cần ví dụ, hãy cho 1 ví dụ đơn giản.

Câu hỏi: ${question}
`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({
      answer: response.text?.trim() || "Mình chưa tạo được câu trả lời.",
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