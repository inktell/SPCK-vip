const orderSummary = document.getElementById('order-summary');
const cartTotal = document.getElementById('cart-total');

function formatPrice(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function loadOrderSummary() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (!orderSummary) return;

  if (cart.length === 0) {
    orderSummary.innerHTML = '<p>Không có sản phẩm trong giỏ hàng.</p>';
    if (cartTotal) cartTotal.textContent = '';
    return;
  }

  let total = 0;
  const itemsHtml = cart.map((item) => {
    const price = Number(item.price || 0);
    total += price * Number(item.quantity || 1);
    return `
      <li class="order-item">
        <div style="display:flex; justify-content:space-between; gap:12px; align-items:center; margin-bottom:8px;">
          <div>
            <strong>${item.name || item.id || 'Sản phẩm'}</strong>
            <div>Số lượng: ${item.quantity}</div>
          </div>
          <div style="text-align:right;">
            <strong>${formatPrice(price * item.quantity)} VND</strong>
            <button class="remove-item" type="button" data-id="${item.id}" style="margin-top:8px; background:#f57224; color:#fff; border:none; padding:0.45rem 0.75rem; border-radius:6px; cursor:pointer;">Xóa</button>
          </div>
        </div>
      </li>
    `;
  }).join('');

  orderSummary.innerHTML = `<ul style="list-style:none; padding:0; margin:0;">${itemsHtml}</ul>`;
  if (cartTotal) cartTotal.textContent = `Tổng cộng: ${formatPrice(total)} VND`;
}

function removeFromCart(productId) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const updatedCart = cart.filter((item) => String(item.id) !== String(productId));
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  loadOrderSummary();
}

if (orderSummary) {
  orderSummary.addEventListener('click', (event) => {
    const button = event.target.closest('.remove-item');
    if (!button) return;
    const productId = button.dataset.id;
    removeFromCart(productId);
  });
}

window.addEventListener('DOMContentLoaded', loadOrderSummary);
