// Giga - Fast Shopping App

const firebaseConfig = {
  apiKey: "AIzaSyBl1v4j0DMx-ce4rkGZpmijzyUYLLRm9NI",
  authDomain: "bai-3-2f0fc.firebaseapp.com",
  projectId: "bai-3-2f0fc",
  storageBucket: "bai-3-2f0fc.firebasestorage.app",
  messagingSenderId: "300263576892",
  appId: "1:300263576892:web:55c18b93e96985c55b3a39",
  measurementId: "G-38NJ0S7XEP"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();
const ADMIN_EMAIL = 'admin@giga.com';

const API_BASE = 'http://localhost:3000';
const PRODUCT_CACHE_KEY = 'giga_products_cache';
const PLACEHOLDER_IMAGE = 'https://placehold.co/400x300?text=No+Image';

const shopNowBtn = document.getElementById('shop-now');
const productGrid = document.getElementById('product-grid');
const productSearchInput = document.getElementById('product-search');
const categoryFilter = document.getElementById('category-filter');
const cartSection = document.getElementById('cart');
const checkoutSection = document.getElementById('checkout');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutForm = document.getElementById('checkout-form');
const detailSection = document.getElementById('product-detail');
const detailContainer = document.getElementById('detail-container');
const closeDetailBtn = document.getElementById('close-detail');
const userRoleEl = document.getElementById('user-role');
const accountLink = document.getElementById('account-link');
const accountSection = document.getElementById('account');

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = null;
let productList = [];
let productMap = new Map();
let selectedCategory = 'all';
let searchQuery = '';
const detailProductId = new URLSearchParams(window.location.search).get('productId');

function saveProductCache(list) {
  try {
    const payload = JSON.stringify(list);
    localStorage.setItem(PRODUCT_CACHE_KEY, payload);
  } catch (error) {
    console.warn('Không lưu cache sản phẩm:', error);
  }
}

function loadProductCache() {
  try {
    const cache = localStorage.getItem(PRODUCT_CACHE_KEY);
    return cache ? JSON.parse(cache) : [];
  } catch {
    return [];
  }
}

function hydrateProductMap(list) {
  productMap.clear();
  list.forEach((product) => {
    productMap.set(String(product.id), product);
  });
}

const sampleProducts = [
  {
    id: 'sample-1',
    name: 'iPhone 15 Case',
    price: 299000,
    image: 'https://placehold.co/400x300?text=iPhone+15+Case',
    category: 'electronics',
    description: 'Bao da iPhone 15 bền đẹp, chống va đập và bảo vệ toàn diện.'
  },
  {
    id: 'sample-2',
    name: 'Wireless Headset',
    price: 890000,
    image: 'https://placehold.co/400x300?text=Wireless+Headset',
    category: 'electronics',
    description: 'Tai nghe không dây chất lượng cao, âm thanh rõ nét và pin lâu.'
  },
  {
    id: 'sample-3',
    name: 'Running Shoes',
    price: 599000,
    image: 'https://placehold.co/400x300?text=Running+Shoes',
    category: 'fashion',
    description: 'Giày chạy nhẹ, thoáng khí và phù hợp cho vận động hàng ngày.'
  },
  {
    id: 'sample-4',
    name: 'Classic Backpack',
    price: 499000,
    image: 'https://placehold.co/400x300?text=Classic+Backpack',
    category: 'fashion',
    description: 'Ba lô cổ điển nhiều ngăn, tiện dụng cho đi làm và du lịch.'
  },
  {
    id: 'sample-5',
    name: 'Vitamin C Serum',
    price: 249000,
    image: 'https://placehold.co/400x300?text=Vitamin+C+Serum',
    category: 'beauty',
    description: 'Serum vitamin C dưỡng sáng, hỗ trợ cải thiện làn da toàn diện.'
  },
  {
    id: 'sample-6',
    name: 'Smartwatch',
    price: 1290000,
    image: 'https://placehold.co/400x300?text=Smartwatch',
    category: 'electronics',
    description: 'Đồng hồ thông minh tích hợp theo dõi sức khỏe và thông báo thông minh.'
  },
  {
    id: 'sample-7',
    name: 'Desk Lamp',
    price: 399000,
    image: 'https://placehold.co/400x300?text=Desk+Lamp',
    category: 'home',
    description: 'Đèn bàn LED tiết kiệm điện với ánh sáng dễ chịu và điều chỉnh linh hoạt.'
  },
  {
    id: 'sample-8',
    name: 'Storage Organizer',
    price: 355000,
    image: 'https://placehold.co/400x300?text=Storage+Organizer',
    category: 'home',
    description: 'Bộ tổ chức lưu trữ đa năng, giúp không gian ngăn nắp và gọn gàng.'
  },
  {
    id: 'sample-9',
    name: 'USB-C Charger',
    price: 199000,
    image: 'https://placehold.co/400x300?text=USB-C+Charger',
    category: 'electronics',
    description: 'Cáp sạc USB-C nhanh, tương thích với nhiều thiết bị hiện đại.'
  },
  {
    id: 'sample-10',
    name: 'Men’s Hoodie',
    price: 449000,
    image: 'https://placehold.co/400x300?text=Men%E2%80%99s+Hoodie',
    category: 'fashion',
    description: 'Áo hoodie nam thoải mái, chất liệu mềm và phù hợp mặc mọi ngày.'
  },
  {
    id: 'sample-11',
    name: 'Face Mask Pack',
    price: 155000,
    image: 'https://placehold.co/400x300?text=Face+Mask+Pack',
    category: 'beauty',
    description: 'Bộ mặt nạ dưỡng da tiện lợi, hỗ trợ làm sạch và nuôi dưỡng.'
  },
  {
    id: 'sample-12',
    name: 'Travel Mug',
    price: 189000,
    image: 'https://placehold.co/400x300?text=Travel+Mug',
    category: 'home',
    description: 'Ly giữ nhiệt tiện dụng cho việc di chuyển và thưởng thức đồ uống.'
  }
];

function toNumberPrice(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }
  if (value && typeof value === 'object') {
    const candidates = [
      value.current_price,
      value.price,
      value.min_price,
      value.sale_price,
      value.final_price,
    ];
    for (const candidate of candidates) {
      const parsed = toNumberPrice(candidate);
      if (parsed) return parsed;
    }
  }
  return 0;
}

function getProductImage(product) {
  const fallback = 'https://placehold.co/400x300?text=No+Image';
  if (!product) return fallback;
  const candidates = [
    product.image,
    product.main_image,
    product.thumbnail,
    product.image_url,
    product.pic,
  ];
  for (const img of candidates) {
    if (typeof img === 'string' && img.trim()) return img;
  }
  const arrays = [product.images, product.item_images, product.image_urls];
  for (const arr of arrays) {
    if (Array.isArray(arr) && arr.length) {
      const first = arr[0];
      if (typeof first === 'string' && first.trim()) return first;
      if (first && typeof first.url === 'string' && first.url.trim()) return first.url;
    }
  }
  return fallback;
}

function normalizeProduct(raw, fallbackId) {
  return {
    id: String(raw?.item_id ?? raw?.id ?? raw?.sku ?? fallbackId),
    name: String(raw?.title ?? raw?.name ?? 'Sản phẩm Lazada'),
    price: toNumberPrice(raw?.price),
    image: getProductImage(raw),
    category: raw?.category || raw?.cat_name || 'Sản phẩm',
    description: raw?.description || raw?.desc || 'Sản phẩm lấy từ Lazada API.',
  };
}

function saveProductCache(list) {
  const payload = JSON.stringify(list);
  sessionStorage.setItem('giga_products_cache', payload);
  localStorage.setItem('giga_products_cache', payload);
}

function loadProductCache() {
  try {
    const cache = localStorage.getItem('giga_products_cache') || sessionStorage.getItem('giga_products_cache');
    return cache ? JSON.parse(cache) : [];
  } catch {
    return [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeAccountNavigation();
  initAuth();
  setupEventListeners();
  loadProducts().then(() => {
    if (detailProductId) {
      showProductDetail(detailProductId);
    }
    buildCategoryFilter(productList);
  });
  updateCartDisplay();
});

function initializeAccountNavigation() {
  const storedEmail = localStorage.getItem('giga_current_user_email') || sessionStorage.getItem('giga_current_user_email');
  const storedRole = localStorage.getItem('giga_current_user_role') || sessionStorage.getItem('giga_current_user_role');
  syncAccountLinkState(storedRole, Boolean(storedEmail));
  accountLink?.addEventListener('click', handleAccountLinkClick);
}

function syncAccountLinkState(role, hasSession = false) {
  if (!accountLink) return;
  const normalizedRole = String(role || 'customer').toLowerCase();
  if (!hasSession) {
    accountLink.href = 'login.html';
    accountLink.textContent = 'Đăng nhập';
    return;
  }
  // All authenticated users go to profile page
  accountLink.href = 'profile.html';
  accountLink.textContent = 'Thông tin tài khoản';
}

function handleAccountLinkClick(event) {
  // Allow default behavior - just navigate to profile.html
  const storedRole = localStorage.getItem('giga_current_user_role') || sessionStorage.getItem('giga_current_user_role');
  if (!storedRole) {
    // Not logged in, let it navigate to login.html
    return;
  }
}

function initAuth() {
  auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    await updateAuthUI();
  });
}

async function ensureUserRole(user) {
  if (!user || !user.uid) return 'customer';
  const userRef = db.collection('users').doc(user.uid);
  const doc = await userRef.get();
  if (doc.exists) {
    const savedRole = doc.data()?.role;
    if (savedRole) {
      if (String(user.email).toLowerCase() === ADMIN_EMAIL) return 'admin';
      return savedRole;
    }
  }

  const newRole = String(user.email).toLowerCase() === ADMIN_EMAIL ? 'admin' : 'customer';
  await userRef.set({
    email: user.email,
    displayName: user.displayName || '',
    role: newRole,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  return newRole;
}

async function updateAuthUI() {
  const authSection = document.getElementById('auth-section');
  const userInfo = document.getElementById('user-info');

  if (!authSection || !userInfo) return;

  if (currentUser) {
    authSection.classList.add('hidden');
    userInfo.classList.remove('hidden');
    const role = await ensureUserRole(currentUser);
    const normalizedRole = String(role || 'customer').toLowerCase();
    localStorage.setItem('giga_current_user_email', currentUser.email || '');
    localStorage.setItem('giga_current_user_role', normalizedRole);
    sessionStorage.setItem('giga_current_user_email', currentUser.email || '');
    sessionStorage.setItem('giga_current_user_role', normalizedRole);
    const roleLabel = normalizedRole === 'admin' ? 'Quản trị viên' : normalizedRole === 'seller' ? 'Người bán' : 'Khách hàng';
    userInfo.innerHTML = `
      <p>Xin chào, ${currentUser.displayName || currentUser.email}</p>
      <button id="logout-btn">Đăng xuất</button>
    `;
    userRoleEl?.classList.remove('hidden');
    userRoleEl.textContent = roleLabel;
    accountSection?.classList.remove('hidden');
    syncAccountLinkState(normalizedRole, Boolean(currentUser));
    document.getElementById('logout-btn')?.addEventListener('click', logout);
  } else {
    authSection.classList.remove('hidden');
    userInfo.classList.add('hidden');
    userInfo.innerHTML = '';
    localStorage.removeItem('giga_current_user_email');
    localStorage.removeItem('giga_current_user_role');
    sessionStorage.removeItem('giga_current_user_email');
    sessionStorage.removeItem('giga_current_user_role');
    accountSection?.classList.add('hidden');
    if (accountLink) {
      accountLink.href = 'login.html';
    }
    if (userRoleEl) {
      userRoleEl.classList.add('hidden');
      userRoleEl.textContent = '';
    }
  }
}

function login() {
  const email = prompt('Email:');
  const password = prompt('Mật khẩu:');
  if (!email || !password) return;
  auth.signInWithEmailAndPassword(email, password)
    .catch((error) => alert('Lỗi đăng nhập: ' + error.message));
}

function register() {
  const email = prompt('Email:');
  const password = prompt('Mật khẩu:');
  const displayName = prompt('Tên hiển thị:');
  let role = prompt('Loại tài khoản (customer hoặc seller):', 'customer');
  if (!email || !password) return;
  if (!role || !['customer', 'seller'].includes(role.toLowerCase())) {
    role = 'customer';
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      await userCredential.user.updateProfile({ displayName: displayName || '' });
      const userRef = db.collection('users').doc(userCredential.user.uid);
      await userRef.set({
        email: email,
        displayName: displayName || '',
        role: String(email).toLowerCase() === ADMIN_EMAIL ? 'admin' : role.toLowerCase(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    })
    .catch((error) => alert('Lỗi đăng ký: ' + error.message));
}

function logout() {
  auth.signOut();
  localStorage.removeItem('giga_current_user_email');
  localStorage.removeItem('giga_current_user_role');
  sessionStorage.removeItem('giga_current_user_email');
  sessionStorage.removeItem('giga_current_user_role');
}

async function loadProducts() {
  if (!productGrid) return;

  const cachedList = loadProductCache();
  if (cachedList.length > 0) {
    productList = cachedList;
    hydrateProductMap(productList);
    displayProducts(productList);
    buildCategoryFilter(productList);
    if ('requestIdleCallback' in window) {
      requestIdleCallback(fetchRemoteProducts, { timeout: 2000 });
    } else {
      setTimeout(fetchRemoteProducts, 1000);
    }
    return;
  }

  await fetchRemoteProducts();
}

async function fetchRemoteProducts() {
  if (!productGrid) return;

  try {
    const response = await fetch(`${API_BASE}/api/lazada?keyword=laptop`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Không lấy được dữ liệu');
    }

    const data = await response.json();
    const products = data.data?.items || [];

    if (products.length === 0) {
      throw new Error('Danh sách sản phẩm rỗng');
    }

    productList = products.map((p) => ({
      id: String(p.item_id || p.id || p.sku || ''),
      name: String(p.title || p.name || 'Sản phẩm Lazada'),
      price: Number(p.price || p.price_info?.sale_price || 0),
      image: getProductImage(p) || PLACEHOLDER_IMAGE,
      category: p.category || p.cat_name || 'Sản phẩm',
      description: p.description || p.desc || 'Sản phẩm Lazada',
    }));

    hydrateProductMap(productList);
    saveProductCache(productList);
    displayProducts(productList);
    buildCategoryFilter(productList);
  } catch (error) {
    console.warn('Load products error:', error.message || error);
    if (productList.length === 0) {
      productList = sampleProducts;
      hydrateProductMap(productList);
      displayProducts(sampleProducts, 'Đang hiển thị sản phẩm mẫu');
      buildCategoryFilter(sampleProducts);
    }
  }
}

function displayProducts(products, fallbackMessage = '') {
  if (!productGrid) return;
  productGrid.innerHTML = '';

  const fragment = document.createDocumentFragment();

  if (fallbackMessage) {
    const msg = document.createElement('p');
    msg.className = 'fallback-msg';
    msg.textContent = fallbackMessage;
    fragment.appendChild(msg);
  }

  if (!products || products.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent = 'Chưa có sản phẩm để hiển thị.';
    fragment.appendChild(emptyMsg);
    productGrid.appendChild(fragment);
    return;
  }

  const gridFragment = document.createDocumentFragment();
  for (const product of products) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='${PLACEHOLDER_IMAGE}'">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="product-price">${Number(product.price || 0).toLocaleString('vi-VN')} VND</p>
        <div class="card-actions">
          <button class="add-to-cart" data-id="${product.id}">Thêm vào giỏ</button>
          <button class="detail-link" type="button" data-id="${product.id}">Xem chi tiết</button>
        </div>
      </div>
    `;
    gridFragment.appendChild(productCard);
  }

  fragment.appendChild(gridFragment);
  productGrid.appendChild(fragment);
}

productGrid?.addEventListener('click', (event) => {
  const addButton = event.target.closest('.add-to-cart');
  if (addButton) {
    addToCart(String(addButton.dataset.id));
    return;
  }

  const detailButton = event.target.closest('.detail-link');
  if (detailButton) {
    const productId = String(detailButton.dataset.id);
    showProductDetail(productId);
  }
});

function getProductById(id) {
  const normalizedId = String(id);
  if (productMap.has(normalizedId)) {
    return productMap.get(normalizedId);
  }

  const cachedList = loadProductCache();
  if (cachedList.length > 0) {
    hydrateProductMap(cachedList);
    if (productMap.has(normalizedId)) {
      return productMap.get(normalizedId);
    }
  }

  return sampleProducts.find((p) => String(p.id) === normalizedId) || {
    id: normalizedId,
    name: 'Sản phẩm không xác định',
    price: 0,
    image: 'https://placehold.co/300x200?text=No+Image',
    category: 'Sản phẩm',
    description: '',
  };
}

function addToCart(productId) {
  const product = getProductById(productId);
  const existingItem = cart.find((item) => String(item.id) === String(productId));

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: String(productId),
      name: product.name,
      price: Number(product.price || 0),
      image: product.image,
      quantity: 1,
    });
  }

  updateCart();
  alert('Đã thêm sản phẩm vào giỏ hàng');
}

function updateCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartDisplay();
}

function getCategoryList(products) {
  const categories = new Set(['all']);
  products.forEach((product) => {
    const category = String(product.category || 'khác').toLowerCase();
    categories.add(category);
  });
  return Array.from(categories);
}

function formatCategoryName(slug) {
  if (slug === 'all') return 'Tất cả';
  return slug
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildCategoryFilter(products) {
  if (!categoryFilter) return;
  const categories = getCategoryList(products);
  categoryFilter.innerHTML = categories
    .map((category) => `<button type="button" class="category-pill ${category === selectedCategory ? 'active' : ''}" data-category="${category}">${formatCategoryName(category)}</button>`)
    .join('');
}

function applyFilters() {
  const filteredProducts = productList.filter((product) => {
    const matchesSearch = searchQuery
      ? product.name.toLowerCase().includes(searchQuery) || String(product.category || '').toLowerCase().includes(searchQuery)
      : true;
    const matchesCategory = selectedCategory === 'all' ? true : String(product.category || 'khác').toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  displayProducts(filteredProducts, filteredProducts.length === 0 ? 'Không tìm thấy sản phẩm phù hợp.' : '');
}

function updateCartDisplay() {
  const cartItems = document.getElementById('cart-items');
  if (!cartItems) return;

  cartItems.innerHTML = '';
  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Giỏ hàng trống</p>';
    return;
  }

  let total = 0;
  const fragment = document.createDocumentFragment();

  cart.forEach((item) => {
    const product = getProductById(item.id);
    const price = Number(item.price || product.price || 0);
    total += price * item.quantity;

    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://placehold.co/80x80?text=No+Image'">
      <div class="cart-item-info">
        <h4>${product.name}</h4>
        <p>${price.toLocaleString('vi-VN')} VND</p>
      </div>
      <div class="cart-item-quantity">
        <button type="button" onclick="changeQuantity('${item.id}', -1)">-</button>
        <span>${item.quantity}</span>
        <button type="button" onclick="changeQuantity('${item.id}', 1)">+</button>
      </div>
    `;
    fragment.appendChild(cartItem);
  });

  cartItems.appendChild(fragment);
  const totalEl = document.getElementById('cart-total');
  if (totalEl) {
    totalEl.textContent = `Tổng cộng: ${total.toLocaleString('vi-VN')} VND`;
  }
}

function changeQuantity(productId, change) {
  const item = cart.find((entry) => String(entry.id) === String(productId));
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter((entry) => String(entry.id) !== String(productId));
  }
  updateCart();
}

function showProductDetail(productId) {
  const product = getProductById(productId);
  if (!product) {
    alert('Không tìm thấy sản phẩm.');
    return;
  }
  if (detailContainer) {
    detailContainer.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; gap:24px; align-items:flex-start;">
        <img src="${product.image}" alt="${product.name}" style="width:100%; max-width:420px; height:auto; object-fit:cover; border-radius:12px;" onerror="this.src='https://placehold.co/400x300?text=No+Image'">
        <div style="flex:1; min-width:260px;">
          <h3 style="font-size:2rem; margin-bottom:0.75rem;">${product.name}</h3>
          <p style="color: var(--text-secondary); margin:0 0 1rem;">${product.category || 'Danh mục chưa xác định'}</p>
          <p style="font-size:1.6rem; font-weight:700; color:var(--secondary-color); margin-bottom:1rem;">${Number(product.price || 0).toLocaleString('vi-VN')} VND</p>
          <p style="margin-bottom:1.5rem; color:var(--text-secondary); line-height:1.7;">${product.description || 'Không có mô tả.'}</p>
          <div style="display:flex; flex-wrap:wrap; gap:12px;">
            <button class="add-to-cart" data-id="${product.id}" style="padding:12px 20px; border:none; border-radius:12px; background: var(--secondary-color); color:#fff; cursor:pointer;">Thêm vào giỏ</button>
            <button id="detail-back" style="padding:12px 20px; border:1px solid var(--secondary-color); border-radius:12px; background:transparent; color:var(--secondary-color); cursor:pointer;">Quay lại sản phẩm</button>
          </div>
        </div>
      </div>
    `;
    detailSection?.classList.remove('hidden');
    detailSection?.scrollIntoView({ behavior: 'smooth' });
    detailContainer.querySelector('.add-to-cart')?.addEventListener('click', () => addToCart(productId));
    document.getElementById('detail-back')?.addEventListener('click', hideProductDetail);
  }
}

function hideProductDetail() {
  if (detailSection) {
    detailSection.classList.add('hidden');
  }
}

function showCheckout() {
  if (cartSection) cartSection.classList.add('hidden');
  if (checkoutSection) checkoutSection.classList.remove('hidden');
}

function processCheckout(event) {
  event.preventDefault();

  if (!currentUser) {
    alert('Vui lòng đăng nhập để thanh toán');
    return;
  }

  if (cart.length === 0) {
    alert('Giỏ hàng đang trống');
    return;
  }

  alert('Thanh toán thành công!');
  cart = [];
  updateCart();

  if (checkoutSection) checkoutSection.classList.add('hidden');
  if (cartSection) cartSection.classList.remove('hidden');
}

function setupEventListeners() {
  if (shopNowBtn) {
    shopNowBtn.addEventListener('click', () => {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
  if (productSearchInput) {
    productSearchInput.addEventListener('input', (event) => {
      searchQuery = event.target.value.toLowerCase();
      applyFilters();
    });
  }
  if (categoryFilter) {
    categoryFilter.addEventListener('click', (event) => {
      const pill = event.target.closest('.category-pill');
      if (!pill) return;
      selectedCategory = pill.dataset.category || 'all';
      applyFilters();
      categoryFilter.querySelectorAll('.category-pill').forEach((button) => {
        button.classList.toggle('active', button.dataset.category === selectedCategory);
      });
    });
  }
  if (loginBtn) loginBtn.addEventListener('click', login);
  if (registerBtn) registerBtn.addEventListener('click', register);
  if (checkoutBtn) checkoutBtn.addEventListener('click', showCheckout);
  if (checkoutForm) checkoutForm.addEventListener('submit', processCheckout);
  if (closeDetailBtn) closeDetailBtn.addEventListener('click', hideProductDetail);
}

window.changeQuantity = changeQuantity;
