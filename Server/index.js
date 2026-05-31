const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'Client')));

const products = [
  {
    id: 1,
    name: 'Giga Ultra Watch',
    price: 1290000,
    image: 'https://placehold.co/400x300?text=Ultra+Watch',
    category: 'Đồng hồ',
    description: 'Đồng hồ thông minh siêu nhanh với thiết kế sang trọng, hỗ trợ thông báo, đo nhịp tim và pin lâu.',
    stock: 15,
  },
  {
    id: 2,
    name: 'Giga Flash Earbuds',
    price: 799000,
    image: 'https://placehold.co/400x300?text=Flash+Earbuds',
    category: 'Âm thanh',
    description: 'Tai nghe không dây gọn nhẹ, kết nối nhanh, âm thanh trong trẻo, phù hợp mua sắm và nghe nhạc hàng ngày.',
    stock: 32,
  },
  {
    id: 3,
    name: 'Giga Speed Backpack',
    price: 499000,
    image: 'https://placehold.co/400x300?text=Speed+Backpack',
    category: 'Phụ kiện',
    description: 'Balo công nghệ chống nước với nhiều ngăn, thiết kế tối giản cho phong cách hiện đại.',
    stock: 27,
  },
  {
    id: 4,
    name: 'Giga Pro Mouse',
    price: 299000,
    image: 'https://placehold.co/400x300?text=Pro+Mouse',
    category: 'Thiết bị',
    description: 'Chuột chơi game cảm biến chính xác, tốc độ phản hồi cao và độ bền tốt cho trải nghiệm làm việc và giải trí.',
    stock: 40,
  },
];

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', app: 'Giga' });
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((item) => item.id === Number(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
  }
  res.json(product);
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

app.listen(port, () => {
  console.log(`Giga server running on http://localhost:${port}`);
});
