import express from 'express';
import cors from 'cors';
import compression from 'compression';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import upload from './middleware/multer.js';
import cloudinary from './utils/cloudinary.js';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

if (!process.env.GEMINI_API_KEY) {
  console.warn("Thiếu GEMINI_API_KEY trong file .env");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(compression());
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'Client')));

// ----------------- CHATBOT API -----------------
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

    const prompt = `${systemPrompt}\n\n${conversationContext ? `Lịch sử cuộc trò chuyện:\n${conversationContext}\n` : ''}\nKhách hàng: ${question}\n\nTrợ lý:`.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const answer = response.text?.trim() || "Xin lỗi, tôi không thể xử lý câu hỏi này.";

    res.json({
      answer: answer.replace(/^Trợ lý:\s*/, '').trim(),
    });
  } catch (error) {
    console.error(error);
    if (error.status === 429) {
      return res.status(429).json({
        error: "API Key Gemini của bạn đã hết hạn mức sử dụng (Quota Exceeded). Vui lòng kiểm tra lại Google AI Studio.",
      });
    }
    res.status(500).json({
      error: "Gọi Gemini API thất bại. Hãy kiểm tra lại API key và kết nối.",
    });
  }
});


// ----------------- MOCK PRODUCTS -----------------
const products = [
  {
    id: 1,
    name: 'Giga Ultra Watch',
    category: 'Đồng hồ thông minh',
    description: 'Đồng hồ thông minh siêu nhanh với thiết kế sang trọng, hỗ trợ thông báo, đo nhịp tim, theo dõi giấc ngủ và pin lâu.',
    image: 'https://placehold.co/600x600?text=Ultra+Watch',
    gallery: [
      'https://placehold.co/600x600?text=Ultra+Watch+1',
      'https://placehold.co/600x600?text=Ultra+Watch+2',
      'https://placehold.co/600x600?text=Ultra+Watch+3'
    ],
    original_price: 1590000,
    price: 1290000,
    promotion: 'Giảm 19% + Freeship đơn hàng trên 500.000đ',
    discount_label: 'Siêu phẩm giảm giá',
    stock: 15,
    reviews_count: 128,
    rating: 4.7,
    seller: { name: 'Giga Store', location: 'Hồ Chí Minh' },
    shipping_policy: 'Miễn phí giao hàng toàn quốc từ 500.000đ. Giao nhanh 24h nội thành TP.HCM.',
    delivery_commitment: 'Giao hàng đúng hẹn trong 48h, hoàn tiền nếu trễ.',
    options: {
      'Màu': ['Đen', 'Trắng', 'Xanh'],
      'Kích cỡ': ['S', 'M', 'L'],
      'Phiên bản': ['Tiêu chuẩn', 'Pro']
    },
    suggested_products: [
      { id: 2, name: 'Giga Flash Earbuds', price: 799000, image: 'https://placehold.co/400x300?text=Flash+Earbuds' },
      { id: 3, name: 'Giga Speed Backpack', price: 499000, image: 'https://placehold.co/400x300?text=Speed+Backpack' },
      { id: 4, name: 'Giga Pro Mouse', price: 299000, image: 'https://placehold.co/400x300?text=Pro+Mouse' }
    ],
    reviews: [
      { author: 'Lan Anh', rating: 5, title: 'Rất đáng tiền', message: 'Đồng hồ đẹp, chạy mượt và pin dùng được 3 ngày. Dịch vụ giao hàng nhanh.', date: '2026-06-01' },
      { author: 'Minh Tâm', rating: 4, title: 'Thiết kế sang trọng', message: 'Máy đẹp, chức năng đầy đủ. Chỉ mong thêm phiên bản dây kim loại.', date: '2026-05-28' },
      { author: 'Thu Hà', rating: 5, title: 'Hài lòng', message: 'Giao nhanh, shop tư vấn nhiệt tình, mặt đồng hồ rõ nét.', date: '2026-05-15' }
    ]
  },
  {
    id: 2,
    name: 'Giga Flash Earbuds',
    category: 'Tai nghe không dây',
    description: 'Tai nghe không dây gọn nhẹ, kết nối nhanh, âm thanh trong trẻo, phù hợp mua sắm và nghe nhạc hàng ngày.',
    image: 'https://placehold.co/600x600?text=Flash+Earbuds',
    gallery: [
      'https://placehold.co/600x600?text=Flash+Earbuds+1',
      'https://placehold.co/600x600?text=Flash+Earbuds+2'
    ],
    original_price: 999000,
    price: 799000,
    promotion: 'Giảm 20% + ưu đãi kèm dây sạc',
    discount_label: 'Khuyến mãi hot',
    stock: 32,
    reviews_count: 94,
    rating: 4.6,
    seller: { name: 'Giga Audio', location: 'Hà Nội' },
    shipping_policy: 'Giao hàng tiết kiệm toàn quốc với phí giảm 50% cho đơn hàng đầu tiên.',
    delivery_commitment: 'Giao hàng trong 3-5 ngày làm việc, hỗ trợ đổi trả trong 7 ngày.',
    options: {
      'Màu': ['Đen', 'Trắng'],
      'Kết nối': ['Bluetooth 5.0', 'Bluetooth 5.3']
    },
    suggested_products: [
      { id: 1, name: 'Giga Ultra Watch', price: 1290000, image: 'https://placehold.co/400x300?text=Ultra+Watch' },
      { id: 4, name: 'Giga Pro Mouse', price: 299000, image: 'https://placehold.co/400x300?text=Pro+Mouse' }
    ],
    reviews: [
      { author: 'Hoàng Dương', rating: 5, title: 'Âm thanh tuyệt vời', message: 'Tiếng treble trong, bass ấm mà không lấn. Pin lâu.', date: '2026-05-20' },
      { author: 'Ngọc Mai', rating: 4, title: 'Thiết kế nhỏ gọn', message: 'Cầm nhẹ, đeo êm. Tốc độ ghép đôi nhanh.', date: '2026-05-13' }
    ]
  },
  {
    id: 3,
    name: 'Giga Speed Backpack',
    category: 'Balo công nghệ',
    description: 'Balo công nghệ chống nước với nhiều ngăn, thiết kế tối giản cho phong cách hiện đại.',
    image: 'https://placehold.co/600x600?text=Speed+Backpack',
    gallery: [
      'https://placehold.co/600x600?text=Speed+Backpack+1',
      'https://placehold.co/600x600?text=Speed+Backpack+2'
    ],
    original_price: 599000,
    price: 499000,
    promotion: 'Giảm 17% + tặng móc chìa khóa',
    discount_label: 'Sale cuối tuần',
    stock: 27,
    reviews_count: 76,
    rating: 4.5,
    seller: { name: 'Giga Bags', location: 'Đà Nẵng' },
    shipping_policy: 'Freeship nội thành, phí ship ngoại tỉnh chỉ 15.000đ.',
    delivery_commitment: 'Giao hàng trong 2-4 ngày, đổi trả miễn phí trong 7 ngày.',
    options: {
      'Màu': ['Đen', 'Xám'],
      'Kích thước': ['20L', '25L', '30L']
    },
    suggested_products: [
      { id: 2, name: 'Giga Flash Earbuds', price: 799000, image: 'https://placehold.co/400x300?text=Flash+Earbuds' },
      { id: 4, name: 'Giga Pro Mouse', price: 299000, image: 'https://placehold.co/400x300?text=Pro+Mouse' }
    ],
    reviews: [
      { author: 'An Bình', rating: 5, title: 'Balo rất tiện', message: 'Nhiều ngăn, chống nước tốt. Dùng đi học rất vừa.', date: '2026-05-18' },
      { author: 'Kim Anh', rating: 4, title: 'Chất liệu ổn', message: 'Đẹp, chắc tay. Chỉ mong thêm ngăn laptop riêng to hơn.', date: '2026-05-11' }
    ]
  },
  {
    id: 4,
    name: 'Giga Pro Mouse',
    category: 'Chuột chơi game',
    description: 'Chuột chơi game cảm biến chính xác, tốc độ phản hồi cao và độ bền tốt cho trải nghiệm làm việc và giải trí.',
    image: 'https://placehold.co/600x600?text=Pro+Mouse',
    gallery: [
      'https://placehold.co/600x600?text=Pro+Mouse+1',
      'https://placehold.co/600x600?text=Pro+Mouse+2'
    ],
    original_price: 349000,
    price: 299000,
    promotion: 'Giảm 50.000đ + freeship cho đơn hàng tiếp theo',
    discount_label: 'Mua nhanh hôm nay',
    stock: 40,
    reviews_count: 54,
    rating: 4.4,
    seller: { name: 'Giga Gear', location: 'Hải Phòng' },
    shipping_policy: 'Giao hàng toàn quốc, có bảo hiểm vận chuyển.',
    delivery_commitment: 'Giao trong 2-3 ngày làm việc cho khu vực TP lớn.',
    options: {
      'Màu': ['Đen', 'Xám'],
      'Kiểu dáng': ['Chuột không dây', 'Chuột có dây']
    },
    suggested_products: [
      { id: 1, name: 'Giga Ultra Watch', price: 1290000, image: 'https://placehold.co/400x300?text=Ultra+Watch' },
      { id: 3, name: 'Giga Speed Backpack', price: 499000, image: 'https://placehold.co/400x300?text=Speed+Backpack' }
    ],
    reviews: [
      { author: 'Đức Minh', rating: 5, title: 'Điều khiển mượt', message: 'Chuột nhạy, cầm êm. Giá rất hợp lý so với chất lượng.', date: '2026-05-22' },
      { author: 'My Linh', rating: 4, title: 'Đáng mua', message: 'Phù hợp làm việc và chơi game nhẹ nhàng.', date: '2026-05-09' }
    ]
  }
];

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', app: 'Giga' });
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((item) => String(item.id) === String(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
  }
  res.json(product);
});

app.post('/api/upload/image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Vui lòng gửi file hình ảnh.' });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'giga/products',
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
    });

    res.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error?.message || error);
    res.status(500).json({ error: 'Không thể upload ảnh lên Cloudinary.', detail: error?.message || error });
  } finally {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
  }
});

app.get('/api/lazada', async (req, res) => {
  const keyword = String(req.query.keyword || 'laptop').trim();

  try {
    const response = await axios.get('https://lazada-api.p.rapidapi.com/lazada/search/items', {
      params: {
        keywords: keyword,
        site: 'vn',
        page: 1,
        sort: 'pop',
      },
      headers: {
        'x-rapidapi-key': process.env.RAPID_API_KEY,
        'x-rapidapi-host': 'lazada-api.p.rapidapi.com',
      },
      timeout: 15000,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Lazada proxy error:', error?.response?.data || error.message);
    res.status(500).json({
      error: 'Lỗi gọi Lazada API',
      detail: error.message,
    });
  }
});

app.get('/api/lazada/detail', async (req, res) => {
  const itemId = String(req.query.itemId || '').trim();
  if (!itemId) {
    return res.status(400).json({ error: 'Thiếu itemId' });
  }

  try {
    const response = await axios.get('https://lazada-api.p.rapidapi.com/lazada/item/detail', {
      params: {
        itemId,
        site: 'vn',
      },
      headers: {
        'x-rapidapi-key': process.env.RAPID_API_KEY,
        'x-rapidapi-host': 'lazada-api.p.rapidapi.com',
      },
      timeout: 15000,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Lazada detail proxy error:', error?.response?.data || error.message);
    res.status(500).json({
      error: 'Lỗi gọi Lazada API chi tiết',
      detail: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});