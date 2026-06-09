const express = require('express');
const cors = require('cors');
const compression = require('compression');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const upload = require('./middleware/multer');
const cloudinary = require('./utils/cloudinary');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(compression());
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'Client'), { maxAge: '1d', etag: false }));

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

app.listen(port, () => {
  console.log(`Giga server running on http://localhost:${port}`);
});
