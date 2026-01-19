# 🔐 HƯỚNG DẪN ĐƠN GIẢN - THIẾT LẬP ĐĂNG NHẬP GOOGLE

---

## BƯỚC 1: Vào Google Cloud Console

1. Mở link: https://console.cloud.google.com/apis/credentials
2. Đăng nhập Google nếu cần

---

## BƯỚC 2: Tạo OAuth Client

1. Click nút **"+ CREATE CREDENTIALS"** (nút xanh phía trên)
2. Chọn **"OAuth client ID"**
3. Nếu được yêu cầu cấu hình consent screen:
   - Chọn **External** → Create
   - Điền App name: `DTA Studio`
   - Điền email của bạn → Save
4. Quay lại tạo OAuth client:
   - Application type: **Web application**
   - Name: `DTA Web`
   - Authorized redirect URIs → Click **+ ADD URI**
   - Dán: `https://zlsyyhqtggyhmvnbaoac.supabase.co/auth/v1/callback`
   - Click **CREATE**

5. ⚠️ **GHI LẠI 2 thông tin xuất hiện:**
   - Client ID
   - Client Secret

---

## BƯỚC 3: Vào Supabase Dashboard

1. Mở link: https://supabase.com/dashboard/project/zlsyyhqtggyhmvnbaoac/auth/providers
2. Đăng nhập nếu cần

---

## BƯỚC 4: Bật Google Provider

1. Tìm **Google** trong danh sách
2. Click vào toggle để bật (chuyển sang màu xanh)
3. Dán **Client ID** và **Client Secret** từ Bước 2
4. Click **Save**

---

## BƯỚC 5: Cấu hình URL

1. Vào: https://supabase.com/dashboard/project/zlsyyhqtggyhmvnbaoac/auth/url-configuration
2. Điền Site URL: `http://localhost:5173`
3. Thêm Redirect URLs:
   - `http://localhost:5173`
   - `http://localhost:5173/**`
4. Click **Save**

---

## BƯỚC 6: Chạy thử

Sau khi npm install xong, chạy:
```
npm run dev
```

Mở http://localhost:5173/auth và thử đăng nhập bằng Google!

---

**CÓ LỖI? Báo lại cho tôi kèm ảnh chụp màn hình!**
