// Giga E-Commerce App Logic (main.js)

// 1. Dữ liệu sản phẩm (ưu tiên API RapidAPI)
const API_BASE = "http://localhost:3001";
const CART_STORAGE_KEY = "giga_cart";
let PRODUCTS = [];

// 2. Trạng thái ứng dụng (Application State)
let currentCategory = "all";
let searchQuery = "";
let cart = loadCart();
let orders = [];
let isLoggedIn = false;
let userProfile = {
    name: "Khách hàng Danh dự",
    email: "vip-customer@giga.com",
    address: "Bạch Đằng, Quận Bình Thạnh, TP. Hồ Chí Minh"
};

function toNumberPrice(value) {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
        const parsed = Number(value.replace(/[^\d.-]/g, ""));
        return Number.isFinite(parsed) ? parsed : 0;
    }
    if (value && typeof value === "object") {
        const candidates = [value.current_price, value.price, value.min_price, value.sale_price, value.final_price];
        for (const candidate of candidates) {
            const parsed = toNumberPrice(candidate);
            if (parsed) return parsed;
        }
    }
    return 0;
}

function getProductImage(product) {
    const fallback = "https://placehold.co/600x400/fff9f3/1a1a1a?text=No+Image";
    if (!product) return fallback;
    const candidates = [product.image, product.main_image, product.thumbnail, product.image_url, product.pic];
    for (const candidate of candidates) {
        if (typeof candidate === "string" && candidate.trim()) return candidate;
    }

    const arrays = [product.images, product.item_images, product.image_urls];
    for (const array of arrays) {
        if (Array.isArray(array) && array.length > 0) {
            const first = array[0];
            if (typeof first === "string" && first.trim()) return first;
            if (first && typeof first.url === "string" && first.url.trim()) return first.url;
        }
    }

    return fallback;
}

function normalizeProduct(raw, fallbackId = "") {
    const id = String(raw?.item_id ?? raw?.id ?? raw?.sku ?? fallbackId);
    return {
        id,
        name: String(raw?.title ?? raw?.name ?? "Sản phẩm Lazada"),
        category: String(raw?.category || raw?.cat_name || "general"),
        price: toNumberPrice(raw?.price ?? raw?.sale_price ?? raw?.current_price ?? raw?.min_price ?? raw?.price_info?.sale_price),
        oldPrice: toNumberPrice(raw?.original_price ?? raw?.oldPrice ?? raw?.price_info?.original_price ?? raw?.price_info?.price ?? raw?.price ?? 0),
        image: getProductImage(raw),
        rating: Number(raw?.rating || raw?.star || 4.8),
        reviewsCount: Number(raw?.reviews_count || raw?.sold_count || 0),
        description: String(raw?.description || raw?.desc || "Sản phẩm chất lượng cao từ API."),
        options: {
            colors: [raw?.color || "Mặc định"],
            sizes: [raw?.size || "Mặc định"]
        }
    };
}

function loadCart() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        console.warn("Không đọc được giỏ hàng:", error);
        return [];
    }
}

function persistCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
}

// 3. Khởi chạy khi tài liệu sẵn sàng (Initialization)
document.addEventListener("DOMContentLoaded", () => {
    // Tải sản phẩm từ API lúc đầu
    loadProductsFromApi();
    updateCartBadge();
    
    // Gắn sự kiện lắng nghe tìm kiếm
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.toLowerCase();
            renderProducts();
        });
    }

    // Đọc giỏ hàng và đơn hàng từ LocalStorage nếu có
    cart = loadCart();
    updateCartBadge();
    
    const savedOrders = localStorage.getItem("giga_orders");
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
    
    const savedProfile = localStorage.getItem("giga_profile");
    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
        document.getElementById("profile-name").value = userProfile.name;
        document.getElementById("profile-email").value = userProfile.email;
        document.getElementById("profile-address").value = userProfile.address;
    }

    const savedEmail = localStorage.getItem("giga_current_user_email") || sessionStorage.getItem("giga_current_user_email");
    const savedRole = localStorage.getItem("giga_current_user_role") || sessionStorage.getItem("giga_current_user_role");
    isLoggedIn = Boolean(savedEmail || savedRole);
    toggleAuthUI();
});

// 4. Bộ định tuyến hiển thị View (Local Routing)
function goToProfilePage() {
    window.location.href = "profile.html";
}

function showSection(sectionId) {
    if (sectionId === "account") {
        goToProfilePage();
        return;
    }

    const sections = ["home", "shop", "cart", "checkout", "account"];
    sections.forEach(id => {
        const sectionEl = document.getElementById(id);
        if (sectionEl) {
            if (id === sectionId) {
                sectionEl.classList.remove("hidden");
            } else {
                sectionEl.classList.add("hidden");
            }
        }
    });

    // Cập nhật trạng thái active trên thanh điều hướng
    const links = document.querySelectorAll("#nav-links a");
    links.forEach(link => {
        link.classList.remove("active");
        const onclickAttr = link.getAttribute("onclick");
        if (onclickAttr && onclickAttr.includes(`'${sectionId}'`)) {
            link.classList.add("active");
        }
    });

    // Cuộn lên đầu trang
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Cập nhật giao diện riêng biệt cho từng trang khi mở
    if (sectionId === "shop") {
        renderProducts();
        const detailContainer = document.getElementById("detail-panel-container");
        if (detailContainer) {
            detailContainer.classList.add("hidden");
        }
    } else if (sectionId === "cart") {
        renderCart();
    } else if (sectionId === "checkout") {
        updateCheckoutSummary();
    } else if (sectionId === "account") {
        renderOrderHistory();
    }
}

// Format giá tiền Việt Nam
function formatPrice(number) {
    const safeNumber = Number(number || 0);
    return safeNumber.toLocaleString('vi-VN') + 'đ';
}

async function loadProductsFromApi() {
    try {
        const response = await fetch(`${API_BASE}/api/lazada?keyword=laptop`, { cache: "no-store" });
        if (!response.ok) throw new Error("Không tải được danh sách sản phẩm");

        const payload = await response.json();
        const items = Array.isArray(payload?.data?.items)
            ? payload.data.items
            : Array.isArray(payload?.items)
                ? payload.items
                : Array.isArray(payload?.products)
                    ? payload.products
                    : Array.isArray(payload)
                        ? payload
                        : [];

        if (items.length === 0) {
            throw new Error("Danh sách sản phẩm rỗng");
        }

        PRODUCTS = items.map((product, index) => normalizeProduct(product, String(index + 1)));
        renderProducts();
    } catch (error) {
        console.warn("API products unavailable, using empty state:", error.message || error);
        PRODUCTS = [];
        renderProducts();
    }
}

// 5. Quản lý Hiển thị và Lọc Sản phẩm (Products Display & Filter)
function renderProducts() {
    const gridContainer = document.getElementById("product-grid-container");
    const resultSummary = document.getElementById("result-summary");
    if (!gridContainer) return;

    gridContainer.innerHTML = "";

    // Lọc theo danh mục và từ khóa tìm kiếm
    const filtered = PRODUCTS.filter(product => {
        const matchesCategory = (currentCategory === "all" || product.category === currentCategory);
        const matchesSearch = product.name.toLowerCase().includes(searchQuery) || 
                              product.description.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (resultSummary) {
        resultSummary.textContent = "";
    }

    if (filtered.length === 0) {
        gridContainer.innerHTML = `<p class="fallback-msg" style="grid-column: 1/-1;">Không tìm thấy sản phẩm nào phù hợp.</p>`;
        return;
    }

    filtered.forEach(product => {
        const oldPrice = product.oldPrice || product.original_price || Math.round(Number(product.price || 0) * 1.15);
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <div class="product-card-img-wrapper" style="cursor: pointer;" onclick="showProductDetail('${product.id}')">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/600x400/fff9f3/1a1a1a?text=${encodeURIComponent(product.name)}'">
            </div>
            <div class="product-info">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; gap: 0.5rem; flex-wrap: wrap;">
                        <span class="product-tag">${product.category}</span>
                        <span style="font-size: 0.85rem; color: var(--secondary-color); font-weight: bold;">★ ${product.rating || 4.8}</span>
                    </div>
                    <h3 style="cursor: pointer;" onclick="showProductDetail('${product.id}')">${product.name}</h3>
                    <p>${(product.description || "Sản phẩm chất lượng cao").substring(0, 85)}...</p>
                </div>
                <div>
                    <div class="product-price">
                        <span style="text-decoration: line-through; font-size: 0.95rem; color: var(--text-secondary); margin-right: 0.5rem;">${formatPrice(oldPrice)}</span>
                        <span>${formatPrice(product.price)}</span>
                    </div>
                    <div class="card-actions">
                        <button class="add-to-cart" onclick="quickAddToCart('${product.id}')">Thêm vào giỏ</button>
                        <a href="product.html?id=${encodeURIComponent(product.id)}" class="detail-link">Chi tiết</a>
                    </div>
                </div>
            </div>
        `;
        gridContainer.appendChild(card);
    });
}

function filterByCategory(category) {
    currentCategory = category;
    
    // Cập nhật class active cho các pills
    const pills = document.querySelectorAll("#category-filter-container .category-pill");
    pills.forEach(pill => {
        const onclickAttr = pill.getAttribute("onclick");
        if (onclickAttr && onclickAttr.includes(`'${category}'`)) {
            pill.classList.add("active");
        } else {
            pill.classList.remove("active");
        }
    });

    renderProducts();
}

// 6. Chi tiết Sản phẩm Tương tác (Product Detail Panel)
function showProductDetail(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    window.location.href = `product.html?id=${encodeURIComponent(productId)}`;
}

function selectOption(button, type) {
    // Bỏ active của các nút cùng nhóm
    const parent = button.parentElement;
    const buttons = parent.querySelectorAll(".option-button");
    buttons.forEach(btn => btn.classList.remove("active"));
    
    // Set active cho nút được bấm
    button.classList.add("active");
}

function closeProductDetail() {
    const detailContainer = document.getElementById("detail-panel-container");
    if (detailContainer) {
        detailContainer.classList.add("hidden");
    }
    document.getElementById("shop").scrollIntoView({ behavior: "smooth", block: "start" });
}

// 7. Công cụ Giỏ Hàng (Cart Engine)
function updateCartBadge() {
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById("cart-count");
    if (badge) {
        badge.innerText = totalQty;
    }
}

function quickAddToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const defaultColor = product.options?.colors?.[0] || "Mặc định";
    const defaultSize = product.options?.sizes?.[0] || "Mặc định";

    addToCart(productId, defaultColor, defaultSize, 1);
    alert(`Đã thêm 1 x ${product.name} (${defaultColor}) vào giỏ hàng.`);
}

function addDetailedToCart(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    // Lấy màu và kích cỡ đang được lựa chọn active
    const colorBtn = document.querySelector("#detail-color-list .option-button.active");
    const sizeBtn = document.querySelector("#detail-size-list .option-button.active");
    
    const color = colorBtn ? colorBtn.innerText : product.options.colors[0];
    const size = sizeBtn ? sizeBtn.innerText : product.options.sizes[0];

    addToCart(productId, color, size, 1);
    alert(`Đã thêm ${product.name} [Màu: ${color}, Size: ${size}] vào giỏ hàng thành công.`);
}

function buyNowDetailed(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const colorBtn = document.querySelector("#detail-color-list .option-button.active");
    const sizeBtn = document.querySelector("#detail-size-list .option-button.active");
    
    const color = colorBtn ? colorBtn.innerText : product.options.colors[0];
    const size = sizeBtn ? sizeBtn.innerText : product.options.sizes[0];

    addToCart(productId, color, size, 1);
    
    // Chuyển hướng nhanh sang trang Checkout thanh toán
    showSection("checkout");
}

function addToCart(productId, color, size, quantity) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item =>
        item.productId === productId && item.color === color && item.size === size
    );

    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            productId: productId,
            name: product.name,
            price: Number(product.price || 0),
            image: product.image,
            color: color,
            size: size,
            quantity: quantity
        });
    }

    persistCart();
}

function changeQuantity(index, delta) {
    if (!cart[index]) return;
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    persistCart();
    renderCart();
}

function renderCart() {
    const cartItemsContainer = document.getElementById("cart-items");
    const emptyMsg = document.getElementById("cart-empty-message");
    const summaryBlock = document.getElementById("cart-summary-block");
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        emptyMsg.classList.remove("hidden");
        summaryBlock.classList.add("hidden");
        return;
    }

    emptyMsg.classList.add("hidden");
    summaryBlock.classList.remove("hidden");

    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItemEl = document.createElement("div");
        cartItemEl.className = "cart-item";
        cartItemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/100x100/fff9f3/1a1a1a?text=${encodeURIComponent(item.name)}'">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.2rem; font-weight: normal;">
                    Màu: ${item.color} | Kích thước: ${item.size}
                </p>
                <p>${formatPrice(item.price)}</p>
            </div>
            <div class="cart-item-quantity">
                <button onclick="changeQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${index}, 1)">+</button>
            </div>
            <div style="margin-left: 1.5rem; font-weight: bold; min-width: 90px; text-align: right;">
                ${formatPrice(itemTotal)}
            </div>
        `;
        cartItemsContainer.appendChild(cartItemEl);
    });

    document.getElementById("cart-total").innerText = formatPrice(total);
}

// 8. Tiến Trình Thanh Toán (Checkout Handler)
function updateCheckoutSummary() {
    const totalSum = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const checkoutTotal = document.getElementById("checkout-total-price");
    if (checkoutTotal) {
        checkoutTotal.innerText = formatPrice(totalSum);
    }
}

function handleCheckoutSubmit(event) {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống. Không thể đặt hàng.");
        showSection("shop");
        return;
    }

    const name = document.getElementById("shipping-name").value;
    const phone = document.getElementById("shipping-phone").value;
    const email = document.getElementById("shipping-email").value;
    const address = document.getElementById("shipping-address").value;
    const payment = document.getElementById("payment-method").value;
    const totalSum = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newOrder = {
        orderId: "GIGA-" + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString('vi-VN') + " " + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        total: totalSum,
        shipping: {
            name: name,
            phone: phone,
            email: email,
            address: address,
            payment: payment
        },
        status: "Đang xử lý hỏa tốc"
    };

    orders.unshift(newOrder);
    localStorage.setItem("giga_orders", JSON.stringify(orders));

    // Xóa giỏ hàng
    cart = [];
    localStorage.removeItem("giga_cart");
    updateCartBadge();

    alert(`Đặt hàng thành công! Đơn hàng mã số ${newOrder.orderId} đang được chuyển sang xử lý hỏa tốc.`);
    
    // Tự động đồng bộ và lưu thông tin sang tài khoản
    userProfile.name = name;
    userProfile.email = email;
    userProfile.address = address;
    localStorage.setItem("giga_profile", JSON.stringify(userProfile));

    // Không ghi đè trạng thái đăng nhập bằng dữ liệu mẫu nữa.
    // Người dùng sẽ dùng trang hồ sơ thật tại profile.html.
    toggleAuthUI();

    // Reset checkout form
    document.getElementById("checkout-form").reset();

    // Chuyển sang xem tài khoản (xem lịch sử đơn hàng vừa tạo)
    showSection("account");
}

// 9. Tài Khoản & Lịch Sử Đơn Hàng
function simulateAuth() {
    window.location.href = "profile.html";
}

function toggleAuthUI() {
    const authSec = document.getElementById("auth-section");
    const profDash = document.getElementById("profile-dashboard");

    if (!authSec || !profDash) return;

    // Luôn hiển thị CTA đăng nhập/đăng ký tại trang chủ.
    // Trang hồ sơ thật nằm ở profile.html.
    authSec.style.display = "block";
    profDash.style.display = "none";

    const accountLink = document.getElementById("account-link");
    if (accountLink) {
        accountLink.innerText = isLoggedIn ? "Tài khoản (đã đăng nhập)" : "Tài khoản";
    }
}

function saveProfile() {
    userProfile.name = document.getElementById("profile-name").value;
    userProfile.email = document.getElementById("profile-email").value;
    userProfile.address = document.getElementById("profile-address").value;

    localStorage.setItem("giga_profile", JSON.stringify(userProfile));
    alert("Cập nhật thông tin tài khoản thành công!");
}

function logoutProfile() {
    isLoggedIn = false;
    localStorage.removeItem("giga_current_user_email");
    localStorage.removeItem("giga_current_user_role");
    sessionStorage.removeItem("giga_current_user_email");
    sessionStorage.removeItem("giga_current_user_role");
    toggleAuthUI();
    window.location.href = "profile.html";
}

function renderOrderHistory() {
    const orderList = document.getElementById("order-history-list");
    const emptyMsg = document.getElementById("order-empty-message");
    if (!orderList) return;

    orderList.innerHTML = "";

    if (orders.length === 0) {
        emptyMsg.classList.remove("hidden");
        return;
    }

    emptyMsg.classList.add("hidden");

    orders.forEach(order => {
        const orderCard = document.createElement("div");
        orderCard.className = "order-card";
        
        const itemsHtml = order.items.map(item => 
            `<p>• <strong>${item.name}</strong> x ${item.quantity} (${item.color}) - <span style="color: var(--secondary-color); font-weight: bold;">${formatPrice(item.price)}</span></p>`
        ).join("");

        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <strong>Mã đơn hàng: ${order.orderId}</strong>
                    <p style="font-size: 0.85rem; margin-top: 0.25rem;">Đặt ngày: ${order.date}</p>
                </div>
                <div style="text-align: right;">
                    <div class="order-total">${formatPrice(order.total)}</div>
                    <span style="display: inline-block; font-size: 0.8rem; background: rgba(245, 114, 36, 0.08); color: var(--secondary-color); border: 1px solid rgba(245, 114, 36, 0.2); border-radius: 999px; padding: 2px 10px; font-weight: bold; margin-top: 0.4rem;">
                        ${order.status}
                    </span>
                </div>
            </div>
            <div class="order-items" style="border-top: 1px solid var(--border-color); padding-top: 0.85rem; margin-top: 0.85rem;">
                ${itemsHtml}
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.75rem; font-style: italic;">
                Gửi tới: ${order.shipping.name} | ${order.shipping.address} | Thanh toán: ${order.shipping.payment.toUpperCase()}
            </div>
        `;
        orderList.appendChild(orderCard);
    });
}
