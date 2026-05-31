const detailContainer = document.getElementById('product-detail');
const query = new URLSearchParams(window.location.search);
const productId = query.get('id');

const API_BASE = 'http://localhost:3000';

const sampleProducts = [
  { id: 'sample-1', name: 'Giga Ultra Watch', price: 1290000, image: 'https://placehold.co/400x300?text=Ultra+Watch', description: 'Đồng hồ thông minh cao cấp phiên bản Giga Ultra.', category: 'Đồng hồ' },
  { id: 'sample-2', name: 'Giga Flash Earbuds', price: 799000, image: 'https://placehold.co/400x300?text=Flash+Earbuds', description: 'Tai nghe không dây âm thanh sống động, độ trễ thấp.', category: 'Âm thanh' },
  { id: 'sample-3', name: 'Giga Speed Backpack', price: 499000, image: 'https://placehold.co/400x300?text=Speed+Backpack', description: 'Balo chống nước phong cách thể thao, năng động.', category: 'Phụ kiện' },
  { id: 'sample-4', name: 'Giga Pro Mouse', price: 299000, image: 'https://placehold.co/400x300?text=Pro+Mouse', description: 'Chuột máy tính công thái học siêu nhạy.', category: 'Thiết bị' }
];

function toNumberPrice(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }
  if (value && typeof value === 'object') {
    return toNumberPrice(
      value.current_price ?? value.price ?? value.min_price ?? value.sale_price ?? value.final_price ?? 0
    );
  }
  return 0;
}

function getProductImage(product) {
  const fallbackImage = 'https://placehold.co/400x400?text=No+Image';
  if (!product) return fallbackImage;

  const candidates = [product.image, product.main_image, product.thumbnail, product.image_url, product.pic];
  for (const img of candidates) {
    if (typeof img === 'string' && img.trim()) return img;
  }

  const arrays = [product.images, product.item_images, product.image_urls];
  for (const arr of arrays) {
    if (Array.isArray(arr) && arr.length) {
      const first = arr[0];
      if (typeof first === 'string' && first.trim()) return first;
      if (first && typeof first.url === 'string' && first.url.trim()) return first.url;
    }
  }
  return fallbackImage;
}

function normalizeProduct(raw, fallbackId) {
  return {
    id: String(raw?.id ?? raw?.item_id ?? raw?.sku ?? fallbackId),
    name: String(raw?.name ?? raw?.title ?? 'Sản phẩm Lazada'),
    price: toNumberPrice(raw?.price),
    image: getProductImage(raw),
    category: raw?.category || raw?.cat_name || 'Sản phẩm',
    description: raw?.description || raw?.desc || 'Sản phẩm từ Lazada API.',
  };
}

function getCacheProducts() {
  try {
    const cache = sessionStorage.getItem('giga_products_cache');
    return cache ? JSON.parse(cache) : [];
  } catch {
    return [];
  }
}

async function findProductById(id) {
  const cache = getCacheProducts().map((item, index) => normalizeProduct(item, index + 1));
  const fromCache = cache.find((item) => String(item.id) === String(id));
  if (fromCache) return fromCache;

  const fromSample = sampleProducts.find((item) => String(item.id) === String(id));
  if (fromSample) return fromSample;

  try {
    const response = await fetch(`${API_BASE}/api/lazada?keyword=laptop`);
    if (!response.ok) return null;
    const data = await response.json();
    const rawProducts = data?.result?.items || data?.items || [];
    const normalized = Array.isArray(rawProducts)
      ? rawProducts.map((item, index) => normalizeProduct(item, index + 1))
      : [];
    return normalized.find((item) => String(item.id) === String(id)) || null;
  } catch {
    return null;
  }
}

async function loadProduct() {
  if (!detailContainer) return;

  if (!productId) {
    detailContainer.innerHTML = '<p style="text-align:center; padding: 2rem;">Không tìm thấy mã sản phẩm.</p>';
    return;
  }

  detailContainer.innerHTML = '<p style="text-align:center; padding:2rem;">Đang tải chi tiết sản phẩm...</p>';

  const product = await findProductById(productId);

  if (!product) {
    detailContainer.innerHTML = '<p style="text-align:center; padding: 2rem; color: red;">Không tìm thấy sản phẩm.</p>';
    return;
  }

  renderProduct(product);
}

function renderProduct(product) {
  detailContainer.innerHTML = `
    <div class="detail-card" style="display: flex; gap: 30px; padding: 20px; background: var(--surface-color); border-radius: 8px;">
      <img src="${product.image}" alt="${product.name}" style="width: 400px; height: 400px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://placehold.co/400x400?text=No+Image'">
      <div class="detail-content" style="flex: 1;">
        <h1 style="font-size: 1.8rem; margin-bottom: 10px;">${product.name}</h1>
        <p class="product-category" style="color: var(--text-secondary); margin-bottom: 15px;">Danh mục: ${product.category || 'Đang cập nhật'}</p>
        <p class="product-price" style="color: var(--secondary-color); font-size: 1.5rem; font-weight: bold; margin-bottom: 20px;">
          ${Number(product.price || 0).toLocaleString('vi-VN')} VND
        </p>
        <div style="margin-bottom: 20px;">
          <h4 style="margin-bottom: 5px;">Mô tả sản phẩm:</h4>
          <p class="detail-description" style="line-height: 1.6; color: var(--text-secondary);">${product.description || ''}</p>
        </div>
        <div class="detail-actions" style="display: flex; gap: 15px;">
          <button id="add-to-cart-detail" style="padding: 10px 20px; background: var(--secondary-color); color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Thêm vào giỏ</button>
          <a class="detail-link" href="order.html" style="padding: 10px 20px; background: var(--secondary-color); color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold;">Xem giỏ hàng</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('add-to-cart-detail')?.addEventListener('click', () => addToCartDetail(product));
}

function addToCartDetail(product) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find((item) => String(item.id) === String(product.id));

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: String(product.id),
      name: product.name,
      price: Number(product.price || 0),
      image: product.image,
      quantity: 1,
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`Đã thêm "${product.name}" vào giỏ hàng thành công!`);
}

window.addEventListener('DOMContentLoaded', loadProduct);
