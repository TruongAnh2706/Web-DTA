
# Hướng Dẫn Thiết Lập Tự Động Lưu Khách Hàng Vào Google Sheets

Để hệ thống web tự động gửi thông tin người đăng ký mới vào file Google Sheets của bạn, hãy làm theo các bước sau:

## Bước 1: Chuẩn bị Google Sheet

1.  Truy cập [Google Sheets](https://sheets.google.com) và tạo một trang tính mới.
2.  Đặt tên cho Sheet (ví dụ: "DTA Studio Customers").
3.  Ở hàng đầu tiên (Hàng 1), điền các tiêu đề cột:
    *   Cột A: `UserID`
    *   Cột B: `Full Name`
    *   Cột C: `Phone`
    *   Cột D: `Email`
    *   Cột E: `Provider`
    *   Cột F: `Account Type`
    *   Cột G: `Subscription Level`
    *   Cột H: `Created At`

## Bước 2: Tạo Apps Script

1.  Tại giao diện Google Sheet, bấm vào menu **Tiện ích mở rộng (Extensions)** > **Apps Script**.
2.  Một tab mới sẽ mở ra. Hãy xóa hết code cũ trong file `Code.gs` và dán đoạn code sau vào:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Lấy dữ liệu từ Web gửi lên
  var data = JSON.parse(e.postData.contents);
  
  // Ghi thêm 1 hàng mới vào cuối trang tính
  sheet.appendRow([
    Utilities.getUuid(),                  // Cột A: UserID (tự tạo)
    data.full_name || '',                 // Cột B: Full Name
    data.phone || '',                     // Cột C: Phone
    data.email,                           // Cột D: Email
    data.provider || 'Credentials',       // Cột E: Provider
    data.account_type || 'Free',          // Cột F: Account Type
    data.subscription_level || 'None',    // Cột G: Subscription Level
    new Date()                            // Cột H: Created At
  ]);
  
  // Trả về kết quả thành công
  return ContentService.createTextOutput(JSON.stringify({'result': 'success'}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3.  Bấm biểu tượng đĩa lêm (💾) hoặc nhấn `Ctrl + S` để lưu lại. Đặt tên dự án là gì cũng được (ví dụ: "WebHook").

## Bước 3: Triển khai (Deploy) Web App

Đây là bước quan trọng nhất để lấy đường link kết nối.

1.  Bấm vào nút **Triển khai (Deploy)** màu xanh ở góc trên bên phải > chọn **Tùy chọn triển khai mới (New deployment)**.
2.  Bấm vào biểu tượng bánh răng (⚙️) bên cạnh chữ "Chọn loại" > chọn **Ứng dụng web (Web app)**.
3.  Điền thông tin:
    *   **Mô tả**: "Webhook nhận khách hàng".
    *   **Thực thi dưới dạng (Execute as)**: Chọn **Tôi (Me) - [Email của bạn]**.
    *   **Ai có quyền truy cập (Who has access)**: **Quan trọng!** Phải chọn **Bất kỳ ai (Anyone)**. (Nếu chọn khác, web sẽ không gửi được dữ liệu).
4.  Bấm **Triển khai (Deploy)**.
5.  Google sẽ yêu cầu cấp quyền (Authorize access).
    *   Bấm **Cấp quyền truy cập**.
    *   Chọn tài khoản Google của bạn.
    *   Nếu hiện màn hình cảnh báo "Google chưa xác minh ứng dụng này", hãy bấm **Nâng cao (Advanced)** > **Đi tới ... (không an toàn)**. (Yên tâm vì đây là code của chính bạn).
    *   Bấm **Cho phép (Allow)**.

## Bước 4: Lấy URL và Cấu hình vào Web

1.  Sau khi triển khai xong, bạn sẽ thấy một mục là **Ứng dụng web (Web app)** với một đường link dài bắt đầu bằng `https://script.google.com/macros/s/...`.
2.  **Copy** đường link đó.
3.  Quay lại project code trên máy tính, mở file `.env` (nằm ở thư mục gốc `dta-studio-hub-main`).
4.  Thêm (hoặc sửa) dòng sau:

```
VITE_GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/XXXXX/exec
```
*(Thay `https://script.google.com...` bằng link bạn vừa copy)*.

5.  Lưu file `.env` và khởi động lại web (`npm run dev`) để cập nhật.

---

## Thông tin dữ liệu được lưu

Mỗi khi có người đăng ký mới, hệ thống sẽ gửi các thông tin sau:

| Trường | Mô tả |
|--------|-------|
| `UserID` | ID duy nhất (tự động tạo) |
| `Full Name` | Họ và tên người dùng |
| `Phone` | Số điện thoại |
| `Email` | Email đăng ký |
| `Provider` | **Google** hoặc **Credentials** |
| `Account Type` | Mặc định: **Free** |
| `Subscription Level` | Mặc định: **None** |
| `Created At` | Thời gian đăng ký |

---

**Chúc mừng!** Bây giờ mỗi khi có người đăng ký tài khoản mới trên Web, thông tin của họ sẽ tự động xuất hiện trong file Google Sheet của bạn.

---

## Hướng dẫn quản lý phân quyền

Để nâng cấp tài khoản người dùng từ **Free** lên **VIP1** hoặc **VIP2**:

1. Mở Google Sheet "Users".
2. Tìm dòng có email người dùng cần nâng cấp.
3. Sửa cột **Account Type** thành `VIP1` hoặc `VIP2`.
4. Yêu cầu người dùng đăng xuất và đăng nhập lại để cập nhật quyền.

> **Lưu ý**: Trong phiên bản hiện tại, web đọc `Account Type` từ `user_metadata` của Supabase. Để hoàn thiện, bạn cần cập nhật thêm logic đọc từ Google Sheets hoặc đồng bộ ngược từ Sheet về Supabase.
