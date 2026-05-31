const PRODUCT_CACHE_KEY = 'giga_products_cache';
const role = localStorage.getItem('giga_current_user_role') || sessionStorage.getItem('giga_current_user_role');
const userEmail = localStorage.getItem('giga_current_user_email') || sessionStorage.getItem('giga_current_user_email') || '';

if (role !== 'seller') {
    window.location.href = 'login.html';
}

const sellerEmailElement = document.getElementById('seller-email');
const activeCountElement = document.getElementById('active-count');
const inactiveCountElement = document.getElementById('inactive-count');
const productsContainer = document.getElementById('seller-products');
const logoutBtn = document.getElementById('logout-btn');

if (sellerEmailElement) {
    sellerEmailElement.textContent = userEmail || 'Chưa đăng nhập';
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('giga_current_user_email');
        localStorage.removeItem('giga_current_user_role');
        sessionStorage.removeItem('giga_current_user_email');
        sessionStorage.removeItem('giga_current_user_role');
        window.location.href = 'login.html';
    });
}

const fallbackProducts = [
    { id: 'prod-1', name: 'iPhone 15 Pro', category: 'Điện thoại', price: 28990000, available: true, description: 'Chip A17 Pro, camera 48MP.' },
    { id: 'prod-2', name: 'MacBook Air M3', category: 'Laptop', price: 32990000, available: true, description: 'Hiệu năng nhẹ, pin bền.' },
    { id: 'prod-3', name: 'Sony WH-1000XM5', category: 'Âm thanh', price: 6490000, available: false, description: 'Chống ồn chủ động, pin lên tới 40h.' },
    { id: 'prod-4', name: 'Samsung Galaxy Watch 7', category: 'Đồng hồ', price: 6990000, available: true, description: 'Theo dõi sức khỏe thông minh.' }
];

function loadProducts() {
    const stored = localStorage.getItem(PRODUCT_CACHE_KEY) || sessionStorage.getItem(PRODUCT_CACHE_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length) return parsed;
        } catch (error) {
            console.warn('Không thể đọc dữ liệu sản phẩm, dùng dữ liệu mẫu.', error);
        }
    }
    return fallbackProducts;
}

function saveProducts(products) {
    const payload = JSON.stringify(products);
    localStorage.setItem(PRODUCT_CACHE_KEY, payload);
    sessionStorage.setItem(PRODUCT_CACHE_KEY, payload);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value);
}

function renderProducts() {
    if (!productsContainer || !activeCountElement || !inactiveCountElement) return;

    const products = loadProducts();
    const activeCount = products.filter(item => item.available).length;
    const inactiveCount = products.length - activeCount;

    activeCountElement.textContent = String(activeCount);
    inactiveCountElement.textContent = String(inactiveCount);

    productsContainer.innerHTML = products.map((product) => `
        <article class="product-row">
            <div>
                <strong>${product.name}</strong>
                <small>${product.category} • ${product.description || 'Sản phẩm bán hàng'}</small>
            </div>
            <div class="product-price">${formatCurrency(product.price)}</div>
            <div class="product-status ${product.available ? '' : 'inactive'}">
                ${product.available ? 'Đang bán' : 'Tạm dừng'}
            </div>
            <button class="toggle-btn" data-product-id="${product.id}" type="button">
                ${product.available ? 'Ẩn sản phẩm' : 'Hiển thị'}
            </button>
        </article>
    `).join('');

    productsContainer.querySelectorAll('.toggle-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;
            const updatedProducts = products.map((product) =>
                product.id === productId ? { ...product, available: !product.available } : product
            );
            saveProducts(updatedProducts);
            renderProducts();
        });
    });
}

renderProducts();
