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
          <span>${item.name || item.id || 'Sản phẩm'} x ${item.quantity}</span>
          <strong>${formatPrice(price * item.quantity)} VND</strong>
        </div>
      </li>
    `;
  }).join('');

  orderSummary.innerHTML = `<ul style="list-style:none; padding:0; margin:0;">${itemsHtml}</ul>`;
  if (cartTotal) cartTotal.textContent = `Tổng cộng: ${formatPrice(total)} VND`;
}

window.addEventListener('DOMContentLoaded', loadOrderSummary);
