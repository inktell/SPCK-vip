const productList = document.getElementById('product-list');

const RAPIDAPI_HOST = 'lazada-api.p.rapidapi.com';
const RAPIDAPI_KEY = 'e1dbdcb0f3msh59c061826b89031p1bf1dcjsn1fea62ce7ffe';
const RAPIDAPI_URL = 'https://lazada-api.p.rapidapi.com/lazada/products/search';

const sampleProducts = [
  {
    title: 'Giga Ultra Watch',
    image: 'https://via.placeholder.com/400x300?text=Ultra+Watch',
    price: { current_price: 1290000 },
    item_id: 'sample-1'
  },
  {
    title: 'Giga Flash Earbuds',
    image: 'https://via.placeholder.com/400x300?text=Flash+Earbuds',
    price: { current_price: 799000 },
    item_id: 'sample-2'
  },
  {
    title: 'Giga Speed Backpack',
    image: 'https://via.placeholder.com/400x300?text=Speed+Backpack',
    price: { current_price: 499000 },
    item_id: 'sample-3'
  },
  {
    title: 'Giga Pro Mouse',
    image: 'https://via.placeholder.com/400x300?text=Pro+Mouse',
    price: { current_price: 299000 },
    item_id: 'sample-4'
  }
];

function getProductImage(product) {
  if (!product) return 'https://via.placeholder.com/150';
  if (typeof product.image === 'string' && product.image.trim()) return product.image;
  if (typeof product.main_image === 'string' && product.main_image.trim()) return product.main_image;
  if (typeof product.thumbnail === 'string' && product.thumbnail.trim()) return product.thumbnail;
  if (typeof product.image_url === 'string' && product.image_url.trim()) return product.image_url;
  if (product.images && Array.isArray(product.images) && product.images.length) {
    const firstImage = product.images[0];
    if (typeof firstImage === 'string') return firstImage;
    if (typeof firstImage?.url === 'string') return firstImage.url;
  }
  if (product.item_images && Array.isArray(product.item_images) && product.item_images.length) {
    const firstItemImage = product.item_images[0];
    if (typeof firstItemImage === 'string') return firstItemImage;
    if (typeof firstItemImage?.url === 'string') return firstItemImage.url;
  }
  return 'https://via.placeholder.com/150';
}

async function loadProducts() {
  if (productList) {
    productList.innerHTML = '<p>Đang tải sản phẩm...</p>';
  }
  try {
    const response = await fetch(RAPIDAPI_URL, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      },
    });

    if (!response.ok) throw new Error('Không thể tải danh sách sản phẩm');
    
    const data = await response.json();
    console.log("Dữ liệu thô từ API:", data); // Kiểm tra cấu trúc trong Console

    // Lazada API thường trả về dữ liệu nằm trong data.result.items hoặc data.items
    const products = data.result?.items || data.items || [];
    if (!Array.isArray(products) || products.length === 0) {
      renderProducts(sampleProducts, 'API trả về danh sách rỗng, đang hiển thị sản phẩm mẫu.');
      return;
    }
    
    renderProducts(products);
  } catch (error) {
    console.error(error);
    renderProducts(sampleProducts, 'Không thể tải API, đang hiển thị sản phẩm mẫu.');
  }
}

function renderProducts(products, fallbackMessage = '') {
  if (!productList) return;
  productList.innerHTML = fallbackMessage
    ? `<p style="margin-bottom: 1rem; color:#333; font-weight:600;">${fallbackMessage}</p>`
    : '';

  if (!Array.isArray(products) || products.length === 0) {
    productList.innerHTML += '<p>Không tìm thấy sản phẩm nào.</p>';
    return;
  }

  productList.innerHTML += products.map(product => {
    // Kiểm tra và lấy đúng thuộc tính từ API (API thường dùng 'title' thay vì 'name')
    const name = product.title || product.name || 'Sản phẩm Lazada';
    const image = getProductImage(product);
    const price = product.price?.current_price || product.price || 0;
    const id = product.item_id || product.id || product.sku || 'unknown';

    return `
    <div class="product-card">
      <img src="${image}" alt="${name}" loading="lazy" style="width:100%; height:200px; object-fit:cover;">
      <div class="product-info">
        <h3 style="font-size: 1rem; margin: 10px 0;">${name.substring(0, 50)}...</h3>
        <p class="product-price" style="color: #f57224; font-weight: bold;">
          ${Number(price).toLocaleString('vi-VN')} VND
        </p>
        <div class="card-actions">
          <a class="detail-link" href="product.html?id=${id}">Xem chi tiết</a>
        </div>
      </div>
    </div>
  `}).join('');
}

window.addEventListener('DOMContentLoaded', loadProducts);