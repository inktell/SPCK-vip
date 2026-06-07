// Giga E-Commerce App Logic (main.js)

// 1. Dữ liệu sản phẩm mẫu (Mock Product Database)
const PRODUCTS = [
    {
        id: "chair-lounge",
        name: "Ghế Bành Lounge Bắc Âu",
        category: "chair",
        price: 4500000,
        oldPrice: 5200000,
        image: "images/chair.png",
        rating: 4.8,
        reviewsCount: 12,
        description: "Ghế thư giãn với chất liệu gỗ tần bì cao cấp và đệm bọc vải lanh tự nhiên nhập khẩu. Thiết kế công thái học mang lại tư thế ngồi dễ chịu tối đa cho phòng khách hoặc phòng đọc sách của bạn.",
        options: {
            colors: ["Kem Cát", "Xám Nhạt", "Nâu Đất"],
            sizes: ["Tiêu Chuẩn"]
        },
        reviews: [
            { user: "Trần Minh H.", rating: 5, date: "02/06/2026", title: "Rất ưng ý", content: "Ghế ngồi êm, độ nghiêng vừa phải. Gỗ gia công rất mịn và chắc chắn. Đóng gói cẩn thận." },
            { user: "Nguyễn Hương G.", rating: 4, date: "28/05/2026", title: "Màu kem rất sang", content: "Đúng chuẩn màu kem Bắc Âu tôi tìm kiếm. Giao hàng hỏa tốc trong 2 giờ tại Sài Gòn." }
        ]
    },
    {
        id: "sofa-cream",
        name: "Sofa Vải Nỉ Cream Luxury",
        category: "sofa",
        price: 15800000,
        oldPrice: 18500000,
        image: "images/sofa.png",
        rating: 4.9,
        reviewsCount: 8,
        description: "Sofa băng dài thiết kế bo cong mềm mại (curved style) thời thượng. Đệm mút cao cấp chống xẹp lún và hệ lò xo túi đàn hồi cao, kết hợp khung xương sồi tự nhiên chống mối mọt.",
        options: {
            colors: ["Trắng Sữa", "Beige Ấm"],
            sizes: ["Băng Đôi (1.8m)", "Băng Ba (2.2m)"]
        },
        reviews: [
            { user: "Lê Hoàng N.", rating: 5, date: "05/06/2026", title: "Sản phẩm đẳng cấp", content: "Đệm sofa ngồi rất thích, không bị lún sâu. Thiết kế bo góc nhìn phòng khách sang hẳn lên." }
        ]
    },
    {
        id: "lamp-brass",
        name: "Đèn Bàn Brass Dome Tối Giản",
        category: "lighting",
        price: 1850000,
        oldPrice: 2400000,
        image: "images/lamp.png",
        rating: 4.7,
        reviewsCount: 24,
        description: "Đèn chụp đồng thau nguyên bản cao cấp. Bề mặt kim loại được chải xước nghệ thuật, tạo ra chao đèn dạng vòm tối giản khuếch tán ánh sáng vàng ấm áp dịu nhẹ cho góc làm việc.",
        options: {
            colors: ["Đồng Xước Vintage", "Vàng Gold Bóng"],
            sizes: ["M (Cao 35cm)", "L (Cao 48cm)"]
        },
        reviews: [
            { user: "Phạm Quốc B.", rating: 5, date: "01/06/2026", title: "Đẹp xuất sắc", content: "Đèn cầm nặng tay, chất liệu đồng thau thật xịn sò. Đặt trên tủ đầu giường nhìn cực sang trọng." }
        ]
    },
    {
        id: "table-oak",
        name: "Bàn Cafe Oak Minimalist",
        category: "table",
        price: 3200000,
        oldPrice: 3900000,
        image: "images/table.png",
        rating: 4.8,
        reviewsCount: 15,
        description: "Bàn trà tròn tinh tế mặt gỗ sồi tự nhiên vân gỗ sắc nét. Mặt bàn phủ lớp bảo vệ bóng mờ chống thấm nước và trầy xước, chân gỗ tự nhiên tiện tròn thuôn gọn phong cách Retro.",
        options: {
            colors: ["Sồi Tự Nhiên", "Sồi Màu Óc Chó (Walnut)"],
            sizes: ["Đường kính 60cm", "Đường kính 80cm"]
        },
        reviews: [
            { user: "Vũ Khánh L.", rating: 4, date: "03/06/2026", title: "Nhỏ gọn, cứng cáp", content: "Bàn lắp ráp dễ dàng, khớp nối khít. Dễ lau chùi khi đổ nước trà ra." }
        ]
    }
];

// 2. Trạng thái ứng dụng (Application State)
let currentCategory = "all";
let searchQuery = "";
let cart = [];
let orders = [];
let isLoggedIn = false;
let userProfile = {
    name: "Khách hàng Danh dự",
    email: "vip-customer@giga.com",
    address: "Bạch Đằng, Quận Bình Thạnh, TP. Hồ Chí Minh"
};

// 3. Khởi chạy khi tài liệu sẵn sàng (Initialization)
document.addEventListener("DOMContentLoaded", () => {
    // Render sản phẩm lúc đầu
    renderProducts();
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
    const savedCart = localStorage.getItem("giga_cart");
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartBadge();
    }
    
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

    const savedAuth = localStorage.getItem("giga_auth");
    if (savedAuth === "true") {
        isLoggedIn = true;
    }
    toggleAuthUI();
});

// 4. Bộ định tuyến hiển thị View (Local Routing)
function showSection(sectionId) {
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
        // Ẩn panel chi tiết khi về lại shop
        document.getElementById("detail-panel-container").classList.add("hidden");
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
    return number.toLocaleString('vi-VN') + 'đ';
}

// 5. Quản lý Hiển thị và Lọc Sản phẩm (Products Display & Filter)
function renderProducts() {
    const gridContainer = document.getElementById("product-grid-container");
    if (!gridContainer) return;

    gridContainer.innerHTML = "";

    // Lọc theo danh mục và từ khóa tìm kiếm
    const filtered = PRODUCTS.filter(product => {
        const matchesCategory = (currentCategory === "all" || product.category === currentCategory);
        const matchesSearch = product.name.toLowerCase().includes(searchQuery) || 
                              product.description.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        gridContainer.innerHTML = `<p class="fallback-msg" style="grid-column: 1/-1;">Không tìm thấy sản phẩm nào phù hợp.</p>`;
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <div class="product-card-img-wrapper" style="cursor: pointer;" onclick="showProductDetail('${product.id}')">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/600x400/fff9f3/1a1a1a?text=${encodeURIComponent(product.name)}'">
            </div>
            <div class="product-info">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">${product.category}</span>
                        <span style="font-size: 0.85rem; color: var(--secondary-color); font-weight: bold;">★ ${product.rating}</span>
                    </div>
                    <h3 style="cursor: pointer;" onclick="showProductDetail('${product.id}')">${product.name}</h3>
                    <p>${product.description.substring(0, 85)}...</p>
                </div>
                <div>
                    <div class="product-price">
                        <span style="text-decoration: line-through; font-size: 0.95rem; color: var(--text-secondary); margin-right: 0.5rem;">${formatPrice(product.oldPrice)}</span>
                        <span>${formatPrice(product.price)}</span>
                    </div>
                    <div class="card-actions">
                        <button class="add-to-cart" onclick="quickAddToCart('${product.id}')">Thêm vào giỏ</button>
                        <a href="#" class="detail-link" onclick="showProductDetail('${product.id}'); return false;">Chi tiết</a>
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

    const detailContainer = document.getElementById("detail-panel-container");
    if (!detailContainer) return;

    // Chọn ngẫu nhiên gợi ý (các sản phẩm khác)
    const suggestions = PRODUCTS.filter(p => p.id !== productId).slice(0, 2);

    detailContainer.innerHTML = `
        <div class="detail-card">
            <div class="detail-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/600x600/fff9f3/1a1a1a?text=${encodeURIComponent(product.name)}'">
            </div>
            <div class="detail-content">
                <div class="product-category">${product.category}</div>
                <h1>${product.name}</h1>
                
                <div class="product-meta">
                    <div class="rating-badge">
                        <span>★ ${product.rating}</span>
                    </div>
                    <span>(${product.reviewsCount} đánh giá từ người dùng)</span>
                </div>

                <div class="price-row">
                    <span class="price-old">${formatPrice(product.oldPrice)}</span>
                    <span class="price-current">${formatPrice(product.price)}</span>
                    <span class="price-tag">Tiết kiệm ${formatPrice(product.oldPrice - product.price)}</span>
                </div>

                <p class="detail-description">${product.description}</p>

                <!-- Lựa chọn cấu hình sản phẩm -->
                <div class="product-options">
                    <div class="option-group">
                        <label>Màu sắc:</label>
                        <div class="option-list" id="detail-color-list">
                            ${product.options.colors.map((color, i) => `
                                <button class="option-button ${i === 0 ? 'active' : ''}" onclick="selectOption(this, 'color')">${color}</button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="option-group">
                        <label>Kích thước:</label>
                        <div class="option-list" id="detail-size-list">
                            ${product.options.sizes.map((size, i) => `
                                <button class="option-button ${i === 0 ? 'active' : ''}" onclick="selectOption(this, 'size')">${size}</button>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="detail-actions">
                    <button class="btn-add" onclick="addDetailedToCart('${product.id}')">Thêm Vào Giỏ Hàng</button>
                    <button class="btn-buy" onclick="buyNowDetailed('${product.id}')">Mua Ngay Lập Tức</button>
                </div>

                <!-- Chính sách bán hàng Giga -->
                <div class="product-policy">
                    <div>
                        <strong>✓ Cam kết chất lượng cao cấp</strong>
                        <p>Bảo hành chính hãng 24 tháng cho mọi chi tiết khung gỗ và lỗi gia công cơ khí.</p>
                    </div>
                    <div>
                        <strong>✓ Đổi trả linh hoạt</strong>
                        <p>Đổi sản phẩm mới miễn phí trong vòng 7 ngày nếu không phù hợp thẩm mỹ không gian sống.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Nhận xét khách hàng -->
        <div class="product-feedback">
            <h2>Nhận Xét Từ Khách Hàng</h2>
            <div id="reviews-list">
                ${product.reviews.map(rev => `
                    <div class="review-card">
                        <div class="review-meta">
                            <strong style="color: var(--text-color);">${rev.user}</strong>
                            <span style="color: var(--secondary-color);">★ ${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</span>
                            <span>Ngày: ${rev.date}</span>
                        </div>
                        <h4 class="review-title">${rev.title}</h4>
                        <p>${rev.content}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Sản phẩm gợi ý -->
        <div class="product-suggestions">
            <h2>Gợi Ý Cho Không Gian Của Bạn</h2>
            <div class="suggestion-grid">
                ${suggestions.map(sug => `
                    <div class="suggestion-card">
                        <img src="${sug.image}" alt="${sug.name}" onerror="this.src='https://placehold.co/300x200/fff9f3/1a1a1a?text=${encodeURIComponent(sug.name)}'">
                        <div class="suggestion-card-body">
                            <strong>${sug.name}</strong>
                            <div class="suggestion-price">${formatPrice(sug.price)}</div>
                            <button class="btn-suggestion" onclick="showProductDetail('${sug.id}')">Xem chi tiết</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <button class="detail-close-btn" onclick="closeProductDetail()">Đóng chi tiết</button>
    `;

    // Hiển thị panel chi tiết và cuộn đến nó
    detailContainer.classList.remove("hidden");
    detailContainer.scrollIntoView({ behavior: "smooth", block: "start" });
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

    // Chọn các tùy chọn mặc định đầu tiên
    const defaultColor = product.options.colors[0];
    const defaultSize = product.options.sizes[0];

    addToCart(productId, defaultColor, defaultSize, 1);
    
    // Hiển thị thông báo nhỏ
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

    // Tìm xem sản phẩm có cùng màu và kích cỡ đã có trong giỏ hàng chưa
    const existingIndex = cart.findIndex(item => 
        item.productId === productId && item.color === color && item.size === size
    );

    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            productId: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            color: color,
            size: size,
            quantity: quantity
        });
    }

    // Lưu vào LocalStorage
    localStorage.setItem("giga_cart", JSON.stringify(cart));
    updateCartBadge();
}

function changeQuantity(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    localStorage.setItem("giga_cart", JSON.stringify(cart));
    updateCartBadge();
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

    // Bật trạng thái đã đăng nhập để hiển thị đơn hàng
    isLoggedIn = true;
    localStorage.setItem("giga_auth", "true");
    toggleAuthUI();

    // Reset checkout form
    document.getElementById("checkout-form").reset();

    // Chuyển sang xem tài khoản (xem lịch sử đơn hàng vừa tạo)
    showSection("account");
}

// 9. Tài Khoản & Lịch Sử Đơn Hàng (Account View & Simulated Login)
function simulateAuth(loginMode) {
    isLoggedIn = true;
    localStorage.setItem("giga_auth", "true");
    
    // Điền thông tin mặc định
    document.getElementById("profile-name").value = userProfile.name;
    document.getElementById("profile-email").value = userProfile.email;
    document.getElementById("profile-address").value = userProfile.address;

    toggleAuthUI();
    renderOrderHistory();

    alert(loginMode ? "Đăng nhập thử nghiệm thành công!" : "Đăng ký thành viên thành công! Bạn nhận được chiết khấu 10% cho lần mua hàng sau.");
}

function toggleAuthUI() {
    const authSec = document.getElementById("auth-section");
    const profDash = document.getElementById("profile-dashboard");

    if (!authSec || !profDash) return;

    if (isLoggedIn) {
        authSec.style.display = "none";
        profDash.style.display = "grid";
        
        // Thay đổi liên kết tiêu đề tài khoản
        const accountLink = document.getElementById("account-link");
        if (accountLink) {
            accountLink.innerText = "Tài khoản (Đã đăng nhập)";
        }
    } else {
        authSec.style.display = "block";
        profDash.style.display = "none";
        
        const accountLink = document.getElementById("account-link");
        if (accountLink) {
            accountLink.innerText = "Tài khoản";
        }
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
    localStorage.removeItem("giga_auth");
    toggleAuthUI();
    alert("Đã đăng xuất khỏi tài khoản.");
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
