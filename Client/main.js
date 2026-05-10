// Giga - Fast Shopping App

// Firebase Configuration (Replace with your actual config)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBl1v4j0DMx-ce4rkGZpmijzyUYLLRm9NI",
  authDomain: "bai-3-2f0fc.firebaseapp.com",
  projectId: "bai-3-2f0fc",
  storageBucket: "bai-3-2f0fc.firebasestorage.app",
  messagingSenderId: "300263576892",
  appId: "1:300263576892:web:55c18b93e96985c55b3a39",
  measurementId: "G-38NJ0S7XEP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Cloudinary Configuration
const cloudinary = cloudinary.Cloudinary.new({ cloud_name: 'your-cloud-name' });

// DOM Elements
const shopNowBtn = document.getElementById('shop-now');
const productGrid = document.getElementById('product-grid');
const cartSection = document.getElementById('cart');
const checkoutSection = document.getElementById('checkout');
const accountSection = document.getElementById('account');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutForm = document.getElementById('checkout-form');

// Cart data
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = null;
let productList = [];

const sampleProducts = [
  {
    id: 1,
    name: 'Giga Ultra Watch',
    price: 1290000,
    image: 'https://via.placeholder.com/400x300?text=Ultra+Watch',
    category: 'Đồng hồ',
    description: 'Đồng hồ thông minh siêu nhanh với thiết kế sang trọng và pin lâu.'
  },
  {
    id: 2,
    name: 'Giga Flash Earbuds',
    price: 799000,
    image: 'https://via.placeholder.com/400x300?text=Flash+Earbuds',
    category: 'Âm thanh',
    description: 'Tai nghe không dây gọn nhẹ, âm thanh rõ nét và kết nối nhanh.'
  },
  {
    id: 3,
    name: 'Giga Speed Backpack',
    price: 499000,
    image: 'https://via.placeholder.com/400x300?text=Speed+Backpack',
    category: 'Phụ kiện',
    description: 'Balo chống nước nhiều ngăn, phù hợp đi làm và mua sắm hàng ngày.'
  },
  {
    id: 4,
    name: 'Giga Pro Mouse',
    price: 299000,
    image: 'https://via.placeholder.com/400x300?text=Pro+Mouse',
    category: 'Thiết bị',
    description: 'Chuột cảm biến chính xác, tốc độ phản hồi cao cho công việc và giải trí.'
  }
];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  loadProducts();
  updateCartDisplay();
  setupEventListeners();
});

// Authentication
function initAuth() {
  auth.onAuthStateChanged((user) => {
    currentUser = user;
    updateAuthUI();
  });
}

function updateAuthUI() {
  const authSection = document.getElementById('auth-section');
  const userInfo = document.getElementById('user-info');

  if (!authSection || !userInfo) return;

  if (currentUser) {
    authSection.classList.add('hidden');
    userInfo.classList.remove('hidden');
    userInfo.innerHTML = `
      <p>Xin chào, ${currentUser.displayName || currentUser.email}</p>
      <button id="logout-btn">Đăng xuất</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', logout);
  } else {
    authSection.classList.remove('hidden');
    userInfo.classList.add('hidden');
  }
}

function login() {
  const email = prompt('Email:');
  const password = prompt('Mật khẩu:');
  auth.signInWithEmailAndPassword(email, password)
    .catch((error) => {
      alert('Lỗi đăng nhập: ' + error.message);
    });
}

function register() {
  const email = prompt('Email:');
  const password = prompt('Mật khẩu:');
  const displayName = prompt('Tên hiển thị:');
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      return userCredential.user.updateProfile({ displayName: displayName });
    })
    .catch((error) => {
      alert('Lỗi đăng ký: ' + error.message);
    });
}

function logout() {
  auth.signOut();
}

// Products
async function loadProducts() {
  if (!productGrid) return;
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Không thể lấy danh sách sản phẩm');
    const products = await response.json();
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error('Danh sách sản phẩm rỗng');
    }
    productList = products;
    displayProducts(products);
  } catch (error) {
    console.warn('Tải API thất bại, sử dụng sản phẩm mẫu:', error);
    productList = sampleProducts;
    displayProducts(sampleProducts, 'Đang hiển thị sản phẩm mẫu. Vui lòng thử lại sau khi máy chủ hoạt động.');
  }
}

function displayProducts(products, fallbackMessage = '') {
  if (!productGrid) return;
  productGrid.innerHTML = '';
  if (fallbackMessage) {
    productGrid.insertAdjacentHTML('beforeend', `<p class="fallback-msg">${fallbackMessage}</p>`);
  }
  if (!products || products.length === 0) {
    productGrid.innerHTML += '<p>Chưa có sản phẩm để hiển thị.</p>';
    return;
  }
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="product-price">${product.price.toLocaleString('vi-VN')} VND</p>
        <div class="card-actions">
          <button class="add-to-cart" data-id="${product.id}">Thêm vào giỏ</button>
          <a class="detail-link" href="product.html?id=${product.id}">Xem chi tiết</a>
        </div>
      </div>
    `;
    productGrid.appendChild(productCard);
  });

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = parseInt(e.target.dataset.id, 10);
      addToCart(productId);
    });
  });
}

// Cart functions
function addToCart(productId) {
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  updateCart();
  alert('Đã thêm sản phẩm vào giỏ hàng');
}

function updateCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartDisplay();
}

function updateCartDisplay() {
  const cartItems = document.getElementById('cart-items');
  if (!cartItems) return;
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Giỏ hàng trống</p>';
    return;
  }

  cart.forEach(item => {
    const product = getProductById(item.id);
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="cart-item-info">
        <h4>${product.name}</h4>
        <p>${product.price.toLocaleString('vi-VN')} VND</p>
      </div>
      <div class="cart-item-quantity">
        <button onclick="changeQuantity(${item.id}, -1)">-</button>
        <span>${item.quantity}</span>
        <button onclick="changeQuantity(${item.id}, 1)">+</button>
      </div>
    `;
    cartItems.appendChild(cartItem);
  });
}

function changeQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter(item => item.id !== productId);
    }
    updateCart();
  }
}

function getProductById(id) {
  return productList.find(p => p.id === id) || { name: 'Sản phẩm không xác định', price: 0, image: 'https://via.placeholder.com/300x200' };
}

// Checkout
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
  alert('Thanh toán thành công!');
  cart = [];
  updateCart();
  if (checkoutSection) checkoutSection.classList.add('hidden');
}

// Navigation
function setupEventListeners() {
  if (shopNowBtn) {
    shopNowBtn.addEventListener('click', () => {
      const productsSection = document.getElementById('products');
      if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth' });
    });
  }
  if (loginBtn) loginBtn.addEventListener('click', login);
  if (registerBtn) registerBtn.addEventListener('click', register);
  if (checkoutBtn) checkoutBtn.addEventListener('click', showCheckout);
  if (checkoutForm) checkoutForm.addEventListener('submit', processCheckout);
}

// Lazy loading images
const images = document.querySelectorAll('img[loading="lazy"]');
if (images.length > 0) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });
  images.forEach(img => imageObserver.observe(img));
}
