// Order page behavior for Giga

const orderSummary = document.getElementById('order-summary');

function loadOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!orderSummary) return;

    if (cart.length === 0) {
        orderSummary.innerHTML = '<p>Không có sản phẩm trong giỏ hàng.</p>';
        return;
    }

    const products = cart.map(item => {
        return `<li>${item.name || 'Sản phẩm'} x ${item.quantity}</li>`;
    }).join('');

    orderSummary.innerHTML = `<ul>${products}</ul>`;
}

window.addEventListener('DOMContentLoaded', loadOrderSummary);
