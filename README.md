# Giga - Fast Shopping Website

Trang web mua sắm nhanh chóng với giao diện tối sang trọng, sử dụng Firebase và Cloudinary.

## Tính năng

- **Tốc độ tối ưu**: Lazy loading, caching, và tối ưu hóa hình ảnh
- **Giao diện tối**: Chủ đề đồng bộ với phông nền tối
- **Firebase**: Lưu trữ thông tin người dùng và đơn hàng
- **Cloudinary**: Quản lý hình ảnh sản phẩm
- **Responsive**: Tương thích với mọi thiết bị

## Cài đặt

1. Clone repository này
2. Mở `index.html` trong trình duyệt hoặc sử dụng server local

## Cấu hình

### Firebase
1. Tạo project trên Firebase Console
2. Thêm config vào `js/app.js` trong biến `firebaseConfig`
3. Bật Authentication và Firestore

### Cloudinary
1. Tạo tài khoản Cloudinary
2. Thêm cloud name vào `js/app.js` trong biến `cloudinary`

## Sử dụng

- Đăng ký/đăng nhập tài khoản
- Duyệt sản phẩm
- Thêm vào giỏ hàng
- Thanh toán nhanh

## Phát triển

- HTML/CSS/JS thuần
- Không sử dụng framework để tối ưu tốc độ