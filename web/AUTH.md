# Frontend Auth – Hướng dẫn test

Phần này b� sung luồng đăng nhập / đăng ký cho frontend (Next.js). Backend Spring
Boot giữ nguyên ở cổng `8085`, `next.config.mjs` đã có proxy `/api/*`, không đụng đến.

## 1. Các file đã tạo / sửa

### Tạo mới
| File | Mục đích |
| --- | --- |
| `web/lib/auth.js` | Tiện ích auth: `saveAuth`, `getToken`, `getUser`, `clearAuth`, `isAuthed`, `logout` |
| `web/lib/api.js` | Wrapper `authFetch` / `authJson` tự gắn `Authorization: Bearer <token>` nếu có token trong localStorage |
| `web/app/login/page.js` | Trang đăng nhập (form email + password) |
| `web/app/register/page.js` | Trang đăng ký (name, email, password, phone, gender) |
| `web/AUTH.md` | File hướng dẫn test này |

### Sửa
| File | Thay đổi |
| --- | --- |
| `web/app/components/Navbar.js` | Thêm nhóm nút `Đăng nhập` / `Đăng ký` (chưa login) hoặc tên user + `Đăng xuất` (đã login). Lắng nghe sự kiện `authchange` để cập nhật ngay khi login/logout |
| `web/app/bookings/page.js` | Guard: nếu chưa có token → redirect `/login`. Mọi fetch `/api/bookings` đi qua `authFetch` để tự gắn header |
| `web/app/page.js` | Bỏ dropdown chọn user cứng, dùng user đang đăng nhập (lấy từ `getUser()`). `POST /api/bookings` đi qua `authFetch`. Hiện banner nhắc đăng nhập khi chưa auth |
| `web/app/globals.css` | Thêm CSS cho `auth-card`, `auth-form`, `nav-user`, `nav-button` (đồng bộ style với phần còn lại) |

## 2. Luồng hoạt động

1. Khi người dùng gõ `http://localhost:3000/login`, trang `/login` gọi
   `POST /api/auth/login` qua `authJson` (trong `lib/api.js`).
2. `authJson` tự gắn `Content-Type: application/json`. Vì API `/auth/login` không
   yêu cầu token, nên không có header Authorization (đúng yêu cầu backend).
3. Thành công → `saveAuth({token, email, name, userId, role})` lưu vào
   `localStorage` (`hotelbooking.token`, `hotelbooking.user`) và phát
   `authchange` để Navbar cập nhật ngay → `router.push('/')`.
4. Trang chủ (`/`) lấy `getUser()` để hiển thị tên và dùng `userId` khi gọi
   `POST /api/bookings`. Mọi call đến `/api/bookings` (cả `GET` lẫn `POST`) đều
   đi qua `authFetch`, nên header `Authorization: Bearer <token>` luôn được tự
   động thêm nếu có token.
5. `/bookings` là trang bảo vệ: khi không có token sẽ redirect sang `/login`.

## 3. Test từng bước

Yêu cầu: backend Spring Boot đang chạy ở `http://localhost:8085`. Trong thư
mục `web/`:

```bash
npm install  # nếu chưa có node_modules
npm run dev
```

Mở `http://localhost:3000`.

### Bước 3.1 – Truy cập `/bookings` khi chưa đăng nhập
1. Mở DevTools → Application → Local Storage, xóa sạch.
2. Vào `http://localhost:3000/bookings`.
3. **Kỳ vọng:** Hiện dòng "Đang chuyển sang trang đăng nhập..." rồi URL đổi
   thành `/login`. Trên Navbar chỉ có nút `Đăng nhập` + `Đăng ký`.

### Bước 3.2 – Đăng ký tài khoản mới
1. Trên Navbar bấm `Đăng ký`.
2. Điền `Họ tên`, `Email` (chưa từng tồn tại), `Mật khẩu` (≥ 6 ký tự),
   `Số điện thoại`, chọn `Giới tính` (Nam / Nữ).
3. Bấm `Tạo tài khoản`.
4. **Kỳ vọng:** Chuyển về `/`. Navbar giờ hiện tên user + nút `Đăng xuất`. Trong
   Local Storage có `hotelbooking.token` (chuỗi JWT) và `hotelbooking.user`
   (JSON).

### Bước 3.3 – Đăng ký trùng email (lỗi)
1. Bấm `Đăng xuất` trên Navbar.
2. Vào lại `/register`, điền y nhưng **trùng email** đã tạo ở bước 3.2.
3. Bấm `Tạo tài khoản`.
4. **Kỳ vọng:** Hiển thị `alert alert-error` với nội dung trả về t� backend (ví
   dụ "Email already in use"). Vẫn ở `/register`, không chuyển trang.

### Bước 3.4 – Đăng nhập sai mật khẩu
1. Từ Navbar bấm `Đăng nhập`.
2. Nhập đúng email (đã đăng ký), nhập sai mật khẩu.
3. Bấm `Đăng nhập`.
4. **Kỳ vọng:** Hiện thông báo lỗi (ví dụ "Wrong password"), không chuyển
   trang.

### Bước 3.5 – Đăng nhập đúng
1. Nhập đúng email + mật khẩu đã tạo ở bước 3.2.
2. **Kỳ vọng:** Chuyển về `/`. Navbar cập nhật: hiện tên user + `Đăng xuất`.
   Trong Local Storage có token + user.

### Bước 3.6 – Đặt phòng
1. Ở `/`, chọn ngày nhận / trả, bấm `Tìm phòng trống`.
2. Bấm `Đặt phòng` trên một phòng bất kỳ.
3. **Kỳ vọng:** DevTools → Network → request `POST /api/bookings` có header
   `Authorization: Bearer eyJ...` (token từ localStorage). Backend trả 200, UI
   hiện toast "Đặt phòng thành công!".

### Bước 3.7 – Xem phiếu đặt
1. Vào `/bookings`.
2. **Kỳ vọng:** Bảng liệt kê các phiếu đặt. Network request `GET /api/bookings`
   có header Authorization. Nếu token hết hạn (401), `authFetch` tự xóa
   `localStorage` (lần sau vào lại trang sẽ redirect `/login`).

### Bư�c 3.8 – Đăng xuất
1. Bấm `Đăng xuất` trên Navbar.
2. **Kỳ vọng:** Navbar trở về trạng thái chỉ có `Đăng nhập` / `Đăng ký`.
   Local Storage đã sạch. Truy cập `/bookings` → redirect `/login`.

## 4. Ghi chú kỹ thuật

- `lib/auth.js` lưu token vào key `hotelbooking.token` và thông tin user vào
  `hotelbooking.user` (cả hai ở localStorage). Không lưu mật kh�u.
- `lib/api.js` export `authFetch(input, init)` — wrapper `fetch` tự đọc
  `getToken()` và gắn header `Authorization: Bearer <token>` nếu có. Cũng có
  `authJson(input, init)` trả về `{ok, status, data}`. Mọi API cần token trong
  tương lai chỉ cần thay `fetch` → `authFetch` (hoặc `authJson`), không hardcode
  token.
- Khi backend trả 401/403, `authFetch` sẽ tự `clearAuth()` để các lần truy cập
  sau không gửi token h�ng.
- `authchange` là `CustomEvent` phát ra khi `saveAuth` / `clearAuth` chạy.
  Navbar lắng nghe event này (cộng với `storage` cho đa tab) để cập nhật ngay
  trong cùng tab mà không cần F5.
- Không động vào `next.config.mjs` và không thay đổi backend.
