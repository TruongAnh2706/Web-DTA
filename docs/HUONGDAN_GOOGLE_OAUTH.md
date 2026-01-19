# 🔐 Hướng Dẫn Thiết Lập Google OAuth Cho DTA Studio Hub

> **Mục tiêu**: Cho phép người dùng đăng nhập bằng tài khoản Google

---

## 📋 Tổng Quan

Để đăng nhập bằng Google hoạt động, bạn cần thiết lập **2 bên**:
1. **Google Cloud Console** - Tạo OAuth 2.0 Client
2. **Supabase Dashboard** - Bật Google Provider và nhập credentials

---

## PHẦN 1: Thiết Lập Google Cloud Console

### Bước 1.1: Truy cập Google Cloud Console

1. Mở trình duyệt và vào: https://console.cloud.google.com/
2. Đăng nhập bằng tài khoản Google của bạn

### Bước 1.2: Tạo hoặc chọn Project

1. Ở góc trên bên trái, click vào dropdown **"Select a project"**
2. Nếu đã có project (ví dụ: `dta-hunter-trend`), chọn nó
3. Nếu chưa có, click **"New Project"**:
   - Project name: `DTA-Studio-Hub`
   - Click **Create**

### Bước 1.3: Cấu hình OAuth Consent Screen

⚠️ **QUAN TRỌNG**: Bước này phải làm trước khi tạo OAuth Client

1. Trong menu bên trái, vào: **APIs & Services** > **OAuth consent screen**
2. Chọn **User Type**: 
   - Chọn **External** (cho phép bất kỳ ai có Google account đăng nhập)
   - Click **Create**
3. Điền thông tin:
   - **App name**: `DTA Studio Hub`
   - **User support email**: Email của bạn
   - **Developer contact email**: Email của bạn
4. Click **Save and Continue** qua các bước còn lại

### Bước 1.4: Tạo OAuth 2.0 Client ID

1. Vào: **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Chọn Application type: **Web application**
4. Đặt tên: `DTA Studio Hub Web Client`
5. Trong phần **Authorized redirect URIs**, thêm:
   ```
   https://zlsyyhqtggyhmvnbaoac.supabase.co/auth/v1/callback
   ```
   > URL này lấy từ Supabase Dashboard (xem Phần 2)

6. Click **Create**

### Bước 1.5: Lưu Credentials

Sau khi tạo xong, Google sẽ hiển thị:
- **Client ID**: `xxxxxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxxxxxxx`

⚠️ **LƯU LẠI CẢ 2 GIÁ TRỊ NÀY** - Bạn sẽ cần nhập vào Supabase

---

## PHẦN 2: Cấu Hình Supabase Dashboard

### Bước 2.1: Đăng nhập Supabase

1. Truy cập: https://supabase.com/dashboard
2. Đăng nhập bằng tài khoản đã tạo project

### Bước 2.2: Vào Project của bạn

1. Tìm và click vào project với URL: `zlsyyhqtggyhmvnbaoac`
2. Hoặc tìm project có tên liên quan đến DTA Studio

### Bước 2.3: Cấu hình Google Provider

1. Trong menu bên trái, vào: **Authentication** > **Providers**
2. Tìm **Google** trong danh sách providers
3. Click vào toggle để **Enable** nó
4. Điền thông tin:
   - **Client ID**: Paste Client ID từ Google Cloud Console
   - **Client Secret**: Paste Client Secret từ Google Cloud Console
5. Lưu lại **Callback URL** hiển thị ở đây (format: `https://[project-ref].supabase.co/auth/v1/callback`)
   - Đảm bảo URL này khớp với URL đã thêm ở Google Cloud Console
6. Click **Save**

### Bước 2.4: Cấu hình Site URL (Quan trọng!)

1. Vào: **Authentication** > **URL Configuration**
2. Kiểm tra và cập nhật:
   - **Site URL**: 
     - Development: `http://localhost:5173`
     - Production: URL website của bạn (vd: `https://dta-studio.vercel.app`)
   - **Redirect URLs** (thêm cả 2):
     - `http://localhost:5173`
     - `http://localhost:5173/**`
     - URL production nếu có

---

## PHẦN 3: Kiểm Tra Hoạt Động

### Bước 3.1: Chạy ứng dụng local

```bash
cd c:\Users\Admin\Downloads\Web-DTA-1
npm install    # (nếu chưa cài)
npm run dev
```

### Bước 3.2: Test đăng nhập

1. Mở trình duyệt và vào: http://localhost:5173/auth
2. Click nút **"Google"**
3. Nếu mọi thứ đúng:
   - Sẽ redirect đến trang đăng nhập Google
   - Chọn tài khoản
   - Redirect về website với trạng thái đã đăng nhập

---

## ❗ Xử Lý Lỗi Thường Gặp

### Lỗi: "Error 400: redirect_uri_mismatch"
**Nguyên nhân**: Redirect URI ở Google Cloud Console không khớp với Supabase
**Giải pháp**: 
- Vào Google Cloud Console > Credentials > Edit OAuth Client
- Kiểm tra Authorized redirect URIs phải chính xác là:
  ```
  https://zlsyyhqtggyhmvnbaoac.supabase.co/auth/v1/callback
  ```

### Lỗi: "Error: access_denied"
**Nguyên nhân**: OAuth consent screen chưa publish hoặc email không được whitelist
**Giải pháp**:
- Vào OAuth consent screen > Publishing status
- Click **"PUBLISH APP"** 
- Hoặc thêm email test vào **Test users**

### Lỗi: "Error: invalid_client"
**Nguyên nhân**: Client ID hoặc Secret sai
**Giải pháp**: Kiểm tra lại credentials đã copy đúng chưa (không có khoảng trắng thừa)

### Sau đăng nhập Google bị redirect về trang trắng
**Nguyên nhân**: Site URL trong Supabase không đúng
**Giải pháp**: 
- Authentication > URL Configuration
- Site URL phải là `http://localhost:5173` (development) hoặc URL production

---

## 📝 Checklist Hoàn Thành

- [ ] Google Cloud Console:
  - [ ] Đã tạo/chọn Project
  - [ ] Đã cấu hình OAuth consent screen
  - [ ] Đã tạo OAuth 2.0 Client ID
  - [ ] Đã thêm Redirect URI: `https://zlsyyhqtggyhmvnbaoac.supabase.co/auth/v1/callback`
  
- [ ] Supabase Dashboard:
  - [ ] Đã bật Google Provider
  - [ ] Đã nhập Client ID và Secret
  - [ ] Đã cấu hình Site URL và Redirect URLs
  
- [ ] Testing:
  - [ ] Đã test đăng nhập bằng Email/Password
  - [ ] Đã test đăng nhập bằng Google OAuth

---

**Nếu gặp vấn đề, hãy báo lại để tôi hỗ trợ thêm!** 🚀
