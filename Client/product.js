const API_BASE = 'http://localhost:3000';
const CART_STORAGE_KEY = 'giga_cart';
let currentProduct = null;

function getStoredProduct(productId) {
    try {
        const sessionProduct = sessionStorage.getItem('giga_selected_product');
        if (sessionProduct) {
            const parsed = JSON.parse(sessionProduct);
            if (String(parsed.id) === String(productId)) {
                return parsed;
            }
        }

        const localProduct = localStorage.getItem('giga_selected_product');
        if (localProduct) {
            const parsed = JSON.parse(localProduct);
            if (String(parsed.id) === String(productId)) {
                return parsed;
            }
        }
    } catch (error) {
        console.warn('Không đọc được sản phẩm đã chọn:', error);
    }
    return null;
}

function formatCurrency(value) {
    const safeValue = Number(value || 0);
    return safeValue.toLocaleString('vi-VN') + 'đ';
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId && productId !== 'undefined' && productId !== 'null') {
        fetchProductDetail(productId);
    } else {
        console.warn('Không tìm thấy ID sản phẩm.');
        loadLocalProduct();
    }
});

async function fetchProductDetail(itemId) {
    const storedProduct = getStoredProduct(itemId);
    if (storedProduct) {
        renderProduct(storedProduct);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/lazada/detail?itemId=${encodeURIComponent(itemId)}`);
        if (!response.ok) throw new Error('Lỗi kết nối API');

        const payload = await response.json();
        const data = payload?.data || payload?.item || payload;
        if (data && (data.name || data.title || data.item_title)) {
            renderProduct(data);
        } else {
            throw new Error('Sản phẩm không tồn tại (404)');
        }
    } catch (error) {
        console.error('Lỗi:', error.message);
        loadLocalProduct();
    }
}

function loadCart() {
    try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.warn('Không đọc được giỏ hàng:', error);
        return [];
    }
}

function persistCart(cartItems) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    const badge = document.getElementById('cart-count');
    if (badge) {
        const totalQty = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        badge.textContent = totalQty;
    }
}

function renderProduct(data) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = data?.id || data?.item_id || data?.itemId || urlParams.get('id') || '';
    currentProduct = { ...data, id: productId };
    const name = data.name || data.title || data.item_title || 'Sản phẩm Giga';
    document.getElementById('productTitle').textContent = name;
    document.getElementById('breadcrumbActive').textContent = name;

    const originalPrice = Number(data.original_price || data.oldPrice || data.originalPrice || data.priceShow || 0);
    const currentPrice = Number(data.price || data.sale_price || data.priceShow || data.current_price || 0);

    document.getElementById('originalPrice').textContent = originalPrice > 0 ? formatCurrency(originalPrice) : '';
    document.getElementById('currentPrice').textContent = currentPrice > 0 ? formatCurrency(currentPrice) : formatCurrency(originalPrice);
    document.getElementById('discountBadge').textContent = data.discount_label || (originalPrice > currentPrice ? 'Ưu đãi hấp dẫn' : 'Hot');
    document.getElementById('ratingValue').textContent = data.rating || data.star || '4.8';
    document.getElementById('soldCount').textContent = `| Đã bán ${data.reviews_count || data.sold_count || 0}`;

    const images = Array.isArray(data.gallery) && data.gallery.length > 0
        ? data.gallery
        : Array.isArray(data.images) && data.images.length > 0
            ? data.images
            : [data.image || data.main_image || 'https://placehold.co/600x600?text=Giga'];
    const mainImg = document.getElementById('mainImg');
    if (mainImg) {
        mainImg.src = images[0];
    }

    const thumbList = document.getElementById('thumbList');
    if (thumbList) {
        thumbList.innerHTML = images.map((img, index) => `
            <img src="${img}" class="thumb-item ${index === 0 ? 'active' : ''}" alt="${name}" onclick="changeImg('${img}')">
        `).join('');
    }

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);

    const descPane = document.getElementById('desc-pane');
    if (descPane) {
        descPane.innerHTML = `
            <div class="mb-4">
                <p>${data.description || 'Sản phẩm chất lượng cao, phù hợp cho nhu cầu mua sắm và sử dụng hàng ngày.'}</p>
                <div class="mt-3 text-muted">${data.promotion || 'Khuyến mãi hấp dẫn đang chờ bạn.'}</div>
            </div>
            <div class="card bg-light border-0 p-3 mt-3">
                <h6 class="fw-bold text-primary"><i class="bi bi-truck"></i> Chính sách giao hàng & bảo hành</h6>
                <ul class="list-unstyled small mb-0">
                    <li><i class="bi bi-geo-alt me-2"></i>${data.seller?.name || 'Giga Store'} • ${data.seller?.location || 'TP.HCM'}</li>
                    <li><i class="bi bi-calendar-check me-2"></i>Dự kiến nhận hàng: <strong>${deliveryDate.toLocaleDateString('vi-VN')}</strong></li>
                    <li><i class="bi bi-box-seam me-2"></i>${data.shipping_policy || 'Giao hàng nhanh toàn quốc, đổi trả linh hoạt.'}</li>
                </ul>
            </div>
        `;
    }
}

function loadLocalProduct() {
    renderProduct({
        name: 'Đang tải thông tin sản phẩm...',
        price: 0,
        original_price: 0,
        description: 'Vui lòng thử lại sau hoặc kiểm tra kết nối API RapidAPI.',
        image: 'https://placehold.co/600x600/0d6efd/fff?text=Giga',
        gallery: ['https://placehold.co/600x600/0d6efd/fff?text=Giga'],
        discount_label: 'Đang tải',
        rating: 4.8,
        reviews_count: 0,
        seller: { name: 'Giga Store', location: 'TP.HCM' },
        shipping_policy: 'Miễn phí vận chuyển cho đơn từ 500.000đ.'
    });
}

function changeImg(src) {
    const mainImg = document.getElementById('mainImg');
    if (mainImg) {
        mainImg.src = src;
    }
    document.querySelectorAll('.thumb-item').forEach(item => item.classList.toggle('active', item.getAttribute('src') === src));
}

function updateQty(val) {
    let input = document.getElementById('quantity');
    let current = parseInt(input.value || '1', 10);
    if (current + val >= 1) input.value = current + val;
}

function addToCart() {
    const name = document.getElementById('productTitle')?.textContent || currentProduct?.name || 'Sản phẩm';
    const quantityInput = document.getElementById('quantity');
    const qty = Math.max(1, Number(quantityInput?.value || 1));

    const cart = loadCart();
    const existingIndex = cart.findIndex((item) => String(item.productId) === String(currentProduct?.id || ''));

    if (existingIndex >= 0) {
        cart[existingIndex].quantity += qty;
    } else {
        cart.push({
            productId: currentProduct?.id || '',
            name,
            price: Number(currentProduct?.price || currentProduct?.current_price || currentProduct?.sale_price || 0),
            image: currentProduct?.image || currentProduct?.main_image || currentProduct?.gallery?.[0] || 'https://placehold.co/120x120?text=Giga',
            color: 'Mặc định',
            size: 'Mặc định',
            quantity: qty,
        });
    }

    persistCart(cart);
    alert(`Đã thêm "${name}" vào giỏ hàng!`);
}