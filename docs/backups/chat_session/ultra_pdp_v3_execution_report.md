# BÁO CÁO CẬP NHẬT ULTRA OVERNIGHT™ STOREFRONT
## LOẠI BỎ FAQ KHỎI MENU · KHẮC PHỤC TRANG TRACK ORDER · XUẤT BẢN TRANG OUR STORY CAO CẤP
### LIVE THEME 197625381235 · VERIFIED 100% TRÊN STORE THẬT (TRYMALORA.COM)

---

### 1. CHI TIẾT CÁC HẠNG MỤC ĐÃ HOÀN THÀNH

#### 1. Loại bỏ "FAQ" khỏi Menu điều hướng (Desktop & Mobile Drawer)
- **Xử lý tận gốc dữ liệu Shopify Navigation**:
  - Truy vấn Admin GraphQL API và cập nhật trực tiếp Menu `gid://shopify/Menu/328729133427` (`ultra-overnight-nav`).
  - Gỡ bỏ mục `/pages/faq`. Danh sách menu chuẩn hóa hiện tại gồm 5 liên kết trọng tâm:
    1. **Home** (`/`)
    2. **ULTRA OVERNIGHT** (`/products/full-spine-ultra-overnight`)
    3. **Our Story** (`/pages/about-us`)
    4. **Track Order** (`/pages/track-order`)
    5. **Contact** (`/pages/contact`)
- **Đồng bộ mã nguồn Section Header (`sections/ultra-header.liquid`)**:
  - Nâng cấp template Liquid tự động duyệt qua `section.settings.primary_menu.links` từ Shopify Admin.
  - Xây dựng fallback tĩnh đồng bộ tuyệt đối không chứa FAQ để bảo đảm an toàn ngay cả khi settings rỗng.
  - Kiểm thử menu drawer trên mobile (`qa_mobile_drawer_no_faq.png`): nút đóng gọn gàng, 5 liên kết chuẩn xác, không còn xuất hiện mục FAQ.

---

#### 2. Khắc phục triệt để lỗi trang "Track Order" (`/pages/track-order`)
- **Nguyên nhân cốt lõi (Root Cause)**:
  - Page object của Shopify (`id=717036716403`) trước đó có trường `"published_at": null` (trạng thái bản nháp ẩn), dẫn đến việc truy cập `/pages/track-order` bị Shopify chuyển hướng trả về trang `404 Not Found`.
- **Giải pháp xử lý & Nâng cấp toàn diện**:
  - Kích hoạt xuất bản trang qua Shopify Admin REST API (`published_at = ISO Timestamp`). Trang hiện phản hồi **HTTP 200 OK**.
  - Thiết kế lại giao diện trang `sections/ultra-track-order.liquid` chuẩn phong cách thương hiệu nữ tính cao cấp:
    - **Tab 1 — Tra cứu theo mã vận đơn (By Tracking Number)**: Tích hợp tra cứu bưu tá trực tiếp (USPS, FedEx, DHL, 17TRACK).
    - **Tab 2 — Tra cứu theo Mã đơn & Email (By Order # & Email)**: Hiển thị hướng dẫn xác thực minh bạch, nút truy cập tài khoản đơn hàng và nút gửi email hỗ trợ soạn sẵn tiêu đề/nội dung gửi đến `support@trymalora.com`.
    - **3 Huy hiệu an tâm (Trust Reassurances)**: Đóng gói trong 1–2 ngày, Bảo hiểm hàng hóa 100%, Thông báo tự động qua SMS/Email.
    - **Khối câu hỏi thường gặp về giao vận (Shipping FAQs)**: Giải đáp chi tiết thời gian vận chuyển, tiến độ cập nhật mã bưu tá và chính sách hỗ trợ.

---

#### 3. Viết và triển khai trang "Our Story" (`/pages/about-us`) đầy ấn tượng
- **Định vị & Câu chuyện thương hiệu (Femtech Textile Engineering)**:
  - Xuất bản chính thức trang `id=717036683635` trên Shopify Online Store channel.
  - Xây dựng cấu trúc câu chuyện giàu cảm xúc và thẩm mỹ couture trong `sections/ultra-about-story.liquid`:
    1. **Tuyên ngôn mở đầu (Hero Statement)**: *We Believed Nighttime Dignity Shouldn't End When Your Heaviest Flow Begins.* (Phá vỡ định kiến về nỗi ám ảnh tràn băng, thức giấc giữa đêm trong những ngày chu kỳ nặng).
    2. **Lỗ hổng kiến trúc của sản phẩm truyền thống (The Architectural Flaw)**: Đồ lót nguyệt san thông thường được thiết kế cho tư thế ngồi ban ngày thay vì tư thế nằm ngủ ngửa (supine posture).
    3. **Tuyên ngôn của đội ngũ sáng lập (Founder Collective)**: Tập thể các nhà thiết kế dệt may nữ và bác sĩ OB/GYN tại Seattle — tạo ra bộ giáp giấc ngủ mang vẻ đẹp đồ lót cao cấp.
    4. **3 Trụ cột đột phá kỹ thuật**:
       - *Full-Spine™ Continuous Gusset*: Dải đệm liên tục từ cạp trước đến tận thắt lưng sau, chống tràn 360 độ cho mọi tư thế ngủ.
       - *Noctéra-5™ System*: 5 lớp kỹ thuật khóa chất lỏng, sức chứa lên đến 40ml (tương đương 8 tampon), thấm hút bề mặt dưới 1.8 giây.
       - *Clean Biocompatibility*: Chuẩn OEKO-TEX® Standard 100, 0% hóa chất vĩnh cửu PFAS/PFOA, bảo vệ hệ vi sinh nhạy cảm.
    5. **Trải nghiệm xúc giác & Đẳng cấp đồ ngủ**: Vải dệt modal-spandex siêu mịn, lớp tiếp xúc 100% cotton organic thoáng khí, êm ái và không phát ra tiếng sột soạt.
    6. **Bảo chứng chuyên môn y khoa (FrontrowMD Clinicians' Choice)**: Trích dẫn chứng thực lâm sàng từ Tiến sĩ Bác sĩ Jennifer T. Nguyen, MD (OB/GYN) và Hội chuyên gia Sức khỏe Vùng chậu Nữ Platinum Providers.
    7. **Số liệu cam kết bền vững**: Sức chứa 40ml, độ bền qua 100+ chu kỳ giặt kiểm nghiệm, tiết kiệm hơn 280 sản phẩm dùng một lần/năm, 0% hóa chất độc hại.
    8. **Kêu gọi hành động (Final CTA)**: Dẫn dắt người dùng trực tiếp đến trang đặt mua flagship FULL-SPINE ULTRA OVERNIGHT™.

---

### 2. HÌNH ẢNH KIỂM CHỨNG TRỰC QUAN TRÊN TRÌNH DUYỆT THẬT

````carousel
![Mobile Navigation Drawer - Hoàn toàn không còn mục FAQ](/C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_mobile_drawer_no_faq.png)
<!-- slide -->
![Trang Our Story trên Desktop (1440px) - Header & Khối dẫn chuyện cao cấp](/C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_about_us_desktop.png)
<!-- slide -->
![Trang Our Story trên Mobile (390px) - Giao diện responsive tinh tế](/C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_about_us_mobile.png)
<!-- slide -->
![Trang Track Order trên Desktop (1440px) - Cổng tra cứu vận đơn & hướng dẫn](/C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_track_order_desktop.png)
<!-- slide -->
![Trang Track Order trên Mobile (390px) - Thẻ tra cứu đối xứng không tràn lề](/C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_track_order_mobile.png)
````

---

### 3. KIỂM THỬ MÃ NGUỒN VÀ TRIỂN KHAI LIVE (READ-AFTER-WRITE AUDIT)

Toàn bộ 22 file giao diện và tài nguyên đã được triển khai lên Shopify Live Theme `197625381235` và vượt qua kiểm tra đối soát mã hash SHA-256:

| Thành phần | Khóa file trên Theme | Trạng thái Live | Kiểm tra Cryptographic |
| :--- | :--- | :---: | :---: |
| **Menu Điều Hướng** | `sections/ultra-header.liquid` | `HTTP 200` | `VERIFIED ✓ (SHA-256 Match)` |
| **Trang Our Story** | `sections/ultra-about-story.liquid` | `HTTP 200` | `VERIFIED ✓ (SHA-256 Match)` |
| **Trang Track Order** | `sections/ultra-track-order.liquid` | `HTTP 200` | `VERIFIED ✓ (SHA-256 Match)` |
| **Template Our Story** | `templates/page.about-us.json` | `HTTP 200` | `VERIFIED ✓ (SHA-256 Match)` |
| **Template Track Order** | `templates/page.track-order.json` | `HTTP 200` | `VERIFIED ✓ (SHA-256 Match)` |
| **Trang sản phẩm PDP** | `templates/product.ultra-overnight.json` | `HTTP 200` | `VERIFIED ✓ (SHA-256 Match)` |
