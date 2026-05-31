const productListEl = document.getElementById('product-list');
const API_BASE = 'http://localhost:3000';

const sampleProducts = [
  {
    title: 'Giga Ultra Watch',
    image: 'https://placehold.co/400x300?text=Ultra+Watch',
    price: { current_price: 1290000 },
    item_id: 'sample-1'
  },
  {
    title: 'Giga Flash Earbuds',
    image: 'https://placehold.co/400x300?text=Flash+Earbuds',
    price: { current_price: 799000 },
    item_id: 'sample-2'
  },
  {
    title: 'Giga Speed Backpack',
    image: 'https://placehold.co/400x300?text=Speed+Backpack',
    price: { current_price: 499000 },
    item_id: 'sample-3'
  },
  {
    title: 'Giga Pro Mouse',
    image: 'https://placehold.co/400x300?text=Pro+Mouse',
    price: { current_price: 299000 },
    item_id: 'sample-4'
  }
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
  const fallbackImage = 'https://placehold.co/400x300?text=No+Image';
  if (!product) return fallbackImage;

  const candidates = [
    product.image,
    product.main_image,
    product.thumbnail,
    product.image_url,
    product.pic,
  ];
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

function normalizeProduct(raw, index) {
  return {
    id: String(raw?.item_id ?? raw?.id ?? raw?.sku ?? `sample-${index}`),
    name: String(raw?.title ?? raw?.name ?? 'Sản phẩm Lazada'),
    price: toNumberPrice(raw?.price),
    image: getProductImage(raw),
    category: raw?.category || raw?.cat_name || 'Sản phẩm',
    description: raw?.description || raw?.desc || 'Sản phẩm từ Lazada API.',
  };
}

function saveProductCache(list) {
  sessionStorage.setItem('giga_products_cache', JSON.stringify(list));
}

async function loadProducts() {
  if (productListEl) {
    productListEl.innerHTML = '<p>Đang tải sản phẩm từ Lazada...</p>';
  }

  try {
    const response = await fetch(`${API_BASE}/api/lazada?keyword=laptop`);
    if (!response.ok) throw new Error(`Lỗi kết nối API: ${response.status}`);

    const data = await response.json();
    const rawProducts = data?.result?.items || data?.items || [];
    const products = Array.isArray(rawProducts)
      ? rawProducts.map((item, index) => normalizeProduct(item, index + 1))
      : [];

    if (!products.length) {
      renderProducts(sampleProducts, 'API trả về danh sách rỗng, đang hiển thị sản phẩm mẫu.');
      saveProductCache(sampleProducts.map((p) => normalizeProduct(p, p.item_id)));
      return;
    }

    saveProductCache(products);
    renderProducts(products);
  } catch (error) {
    console.error('Lỗi xảy ra khi gọi API:', error);
    const fallback = sampleProducts.map((p) => normalizeProduct(p, p.item_id));
    saveProductCache(fallback);
    renderProducts(fallback, 'Đang hiển thị sản phẩm mẫu (Không thể kết nối đến máy chủ).');
  }
}

function renderProducts(products, fallbackMessage = '') {
  if (!productListEl) return;

  productListEl.innerHTML = '';

  if (fallbackMessage) {
    const note = document.createElement('p');
    note.style.marginBottom = '1rem';
    note.style.color = 'var(--secondary-color)';
    note.style.fontWeight = '600';
    note.style.textAlign = 'center';
    note.style.width = '100%';
    note.textContent = fallbackMessage;
    productListEl.appendChild(note);
  }

  if (!Array.isArray(products) || products.length === 0) {
    productListEl.insertAdjacentHTML('beforeend', '<p>Không tìm thấy sản phẩm nào.</p>');
    return;
  }

  products.forEach((product) => {
    const name = product.name || product.title || 'Sản phẩm Lazada';
    const price = toNumberPrice(product.price);
    const image = getProductImage(product);
    const id = String(product.id ?? product.item_id ?? product.sku ?? 'unknown');

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${image}" alt="${name}" loading="lazy" style="width:100%; height:200px; object-fit:cover;" onerror="this.src='https://placehold.co/400x300?text=No+Image'">
      <div class="product-info">
        <h3 style="font-size: 1rem; margin: 10px 0; height: 40px; overflow: hidden;">${name}</h3>
        <p class="product-price" style="color: var(--secondary-color); font-weight: bold; margin-bottom: 10px;">
          ${Number(price).toLocaleString('vi-VN')} VND
        </p>
        <div class="card-actions">
          <a class="detail-link" href="product.html?id=${encodeURIComponent(id)}" style="display: inline-block; padding: 5px 10px; background: var(--secondary-color); color: #fff; text-decoration: none; border-radius: 4px;">Xem chi tiết</a>
        </div>
      </div>
    `;
    productListEl.appendChild(card);
  });
}

window.addEventListener('DOMContentLoaded', loadProducts);
