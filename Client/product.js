/**
 * 1. Cấu hình API (Đồng bộ với index.js)
 */
const CONFIG = {
    API_KEY: '99adcc6dbemsh74b88da359692d8p13ac35jsn5de5b4faeea7',
    API_HOST: 'lazada-api.p.rapidapi.com'
};

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Nâng cao tính năng: Kiểm tra ID trước khi gọi API
    if (productId && productId !== 'undefined' && productId !== 'null') {
        fetchProductDetail(productId);
    } else {
        console.warn("Không tìm thấy ID sản phẩm, đang hiển thị sản phẩm mẫu.");
        loadLocalProduct(); 
    }
});

/**
 * 2. Gọi API lấy chi tiết sản phẩm
 */
async function fetchProductDetail(itemId) {
    const url = `https://lazada-api.p.rapidapi.com/lazada/item/detail?itemId=${itemId}&site=vn`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': CONFIG.API_KEY,
                'x-rapidapi-host': CONFIG.API_HOST
            }
        });

        if (!response.ok) throw new Error("Lỗi kết nối API");

        const result = await response.json();
        
        // Mở rộng danh mục: Xử lý dữ liệu linh hoạt từ API
        const data = result.data || result.item || result;
        
        if (data && (data.title || data.name)) {
            renderProduct(data);
        } else {
            throw new Error("Sản phẩm không tồn tại (404)");
        }

    } catch (error) {
        console.error("Lỗi:", error.message);
        loadLocalProduct(); // Cải thiện trải nghiệm: Luôn có dữ liệu dự phòng
    }
}

/**
 * 3. Hiển thị dữ liệu lên giao diện (Khớp với HTML của bạn)
 */
function renderProduct(data) {
    // Sửa lỗi hiển thị tên sản phẩm thay vì ID
    const name = data.title || data.name || "Sản phẩm ShopInk";
    document.getElementById('productTitle').innerText = name;
    document.getElementById('breadcrumbActive').innerText = name;

    // Hiển thị giá (Ưu tiên priceShow từ API hoặc format số)
    const price = data.priceShow || (data.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.price) : "250.000đ");
    document.getElementById('currentPrice').innerText = price;

    // Hiển thị hình ảnh
    const imgUrl = (data.images && data.images.length > 0) ? data.images[0] : (data.image || "https://placehold.co/600x600?text=ShopInk");
    document.getElementById('mainImg').src = imgUrl;

    // Cải thiện hậu cần: Thêm thông tin giao hàng tự động
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // Dự kiến 3 ngày sau
    
    const descPane = document.getElementById('desc-pane');
    if (descPane) {
        descPane.innerHTML = `
            <div class="mb-4">
                ${data.description || "Sản phẩm văn phòng phẩm chất lượng cao, mực in sắc nét, bền màu."}
            </div>
            <div class="card bg-light border-0 p-3 mt-3">
                <h6 class="fw-bold text-primary"><i class="bi bi-truck"></i> Mạng lưới hậu cần ShopInk</h6>
                <ul class="list-unstyled small mb-0">
                    <li><i class="bi bi-geo-alt me-2"></i>Kho hàng: Quận 1, TP. Hồ Chí Minh</li>
                    <li><i class="bi bi-calendar-check me-2"></i>Dự kiến nhận hàng: <strong>${deliveryDate.toLocaleDateString('vi-VN')}</strong></li>
                    <li><i class="bi bi-box-seam me-2"></i>Tình trạng: Mới 100% - Nguyên seal</li>
                </ul>
            </div>
        `;
    }
}

/**
 * 4. Dữ liệu dự phòng (Mở rộng danh mục nội bộ)
 */
function loadLocalProduct() {
    renderProduct({
        title: "Combo Mực In & Giấy Vẽ ShopInk Premium",
        priceShow: "450.000đ",
        description: "Bộ sản phẩm đặc biệt dành cho họa sĩ và kiến trúc sư, bao gồm mực kháng nước và giấy định lượng 300gsm.",
        image: "https://placehold.co/600x600/0d6efd/fff?text=ShopInk+Premium+Combo"
    });
}

/**
 * 5. Tính năng giỏ hàng đơn giản
 */
function addToCart() {
    const name = document.getElementById('productTitle').innerText;
    alert(`Đã thêm "${name}" vào giỏ hàng!`);
}