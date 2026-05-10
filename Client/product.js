const detailContainer = document.getElementById('product-detail');
const query = new URLSearchParams(window.location.search);
const productId = query.get('id');

async function loadProduct() {
  if (!detailContainer) return;
  if (!productId) {
    detailContainer.innerHTML = '<p>Không tìm thấy sản phẩm.</p>';
    return;
  }
  try {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) throw new Error('Không tìm thấy sản phẩm');
    const product = await response.json();
    renderProduct(product);
  } catch (error) {
    detailContainer.innerHTML = '<p>Không thể tải thông tin sản phẩm.</p>';
  }
}

function renderProduct(product) {
  detailContainer.innerHTML = `
    <div class="detail-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="detail-content">
        <h1>${product.name}</h1>
        <p class="product-category">${product.category}</p>
        <p class="product-price">${product.price.toLocaleString('vi-VN')} VND</p>
        <p class="detail-description">${product.description}</p>
        <div class="detail-actions">
          <button id="add-to-cart-detail">Thêm vào giỏ</button>
          <a class="detail-link" href="menu.html">Xem đơn hàng</a>
        </div>
      </div>
    </div>
  `;
  document.getElementById('add-to-cart-detail').addEventListener('click', () => addToCartDetail(product));
}

function addToCartDetail(product) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: product.id, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('Đã thêm vào giỏ hàng');
}

window.addEventListener('DOMContentLoaded', loadProduct);
