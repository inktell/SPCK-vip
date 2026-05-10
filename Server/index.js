const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const products = [
  {
    id: 1,
    name: 'Giga Ultra Watch',
    price: 1290000,
    image: 'https://via.placeholder.com/400x300?text=Ultra+Watch',
    category: 'Đồng hồ',
    description: 'Đồng hồ thông minh siêu nhanh với thiết kế sang trọng, hỗ trợ thông báo, đo nhịp tim và pin lâu.',
    stock: 15,
  },
  {
    id: 2,
    name: 'Giga Flash Earbuds',
    price: 799000,
    image: 'https://via.placeholder.com/400x300?text=Flash+Earbuds',
    category: 'Âm thanh',
    description: 'Tai nghe không dây gọn nhẹ, kết nối nhanh, âm thanh trong trẻo, phù hợp mua sắm và nghe nhạc hàng ngày.',
    stock: 32,
  },
  {
    id: 3,
    name: 'Giga Speed Backpack',
    price: 499000,
    image: 'https://via.placeholder.com/400x300?text=Speed+Backpack',
    category: 'Phụ kiện',
    description: 'Balo công nghệ chống nước với nhiều ngăn, thiết kế tối giản cho phong cách hiện đại.',
    stock: 27,
  },
  {
    id: 4,
    name: 'Giga Pro Mouse',
    price: 299000,
    image: 'https://via.placeholder.com/400x300?text=Pro+Mouse',
    category: 'Thiết bị',
    description: 'Chuột chơi game cảm biến chính xác, tốc độ phản hồi cao và độ bền tốt cho trải nghiệm mua sắm và làm việc.',
    stock: 40,
  },
];

const orders = [
  {
    id: 101,
    code: 'GIGA2026001',
    total: 2589000,
    date: '2026-05-04',
    status: 'Đã giao',
    items: [
      { name: 'Giga Ultra Watch', quantity: 1, price: 1290000 },
      { name: 'Giga Flash Earbuds', quantity: 1, price: 799000 },
      { name: 'Giga Pro Mouse', quantity: 1, price: 299000 },
    ],
  },
  {
    id: 102,
    code: 'GIGA2026002',
    total: 499000,
    date: '2026-05-05',
    status: 'Đang giao',
    items: [
      { name: 'Giga Speed Backpack', quantity: 1, price: 499000 },
    ],
  },
  {
    id: 103,
    code: 'GIGA2026003',
    total: 1589000,
    date: '2026-05-06',
    status: 'Đang xử lý',
    items: [
      { name: 'Giga Flash Earbuds', quantity: 2, price: 1598000 },
    ],
  },
];

app.use(express.static(path.join(__dirname, '..', 'Client')));

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

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.listen(port, () => {
  console.log(`Giga server running on http://localhost:${port}`);
});
