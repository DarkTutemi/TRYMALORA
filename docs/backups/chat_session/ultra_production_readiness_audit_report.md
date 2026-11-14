# BÁO CÁO THẨM ĐỊNH & KHẮC PHỤC LỖI TOÀN DIỆN STOREFRONT ULTRA OVERNIGHT™
## CRITICAL FIX & PRODUCTION READINESS AUDIT REPORT

---

### THÔNG TIN DỰ ÁN & ĐỊNH DANH HỆ THỐNG
- **Repository**: [https://github.com/DarkTutemi/TRYMALORA](https://github.com/DarkTutemi/TRYMALORA)
- **Branch**: `feat/ultra-overnight-premium-storefront`
- **Commit SHA**: `813d6f1ae06211e2ffbfe2422f0fcb183f305675`
- **Shopify Store**: `ikwh1h-fx.myshopify.com`
- **Tên miền sản xuất**: `trymalora.com`
- **LIVE THEME**: `197144805747` (**TUYỆT ĐỐI KHÔNG CAN THIỆP — GIỮ NGUYÊN 100%**)
- **ULTRA OVERNIGHT DRAFT THEME**: `197625381235` (Theme duy nhất được triển khai và kiểm thử)
- **Draft Theme Preview Link**: [https://ikwh1h-fx.myshopify.com/?preview_theme_id=197625381235](https://ikwh1h-fx.myshopify.com/?preview_theme_id=197625381235)

---

## 1. DANH SÁCH LỖI ĐÃ XÁC NHẬN & NGUYÊN NHÂN GỐC RỄ (ROOT CAUSES)

| Mã lỗi | Mô tả lỗi được xác nhận | Nguyên nhân gốc rễ (Root Cause) | Trạng thái khắc phục |
|---|---|---|---|
| **P0-01** | **Add to Cart bị hỏng / dữ liệu mockup giả lập** | Nút mua hàng và thẻ bundle dùng giá hardcoded ($28, $78, $125), thiếu `data-variant-id` thực. JavaScript gửi request thiếu ID tới `/cart/add.js` rồi giả lập mở cart drawer ngay cả khi lỗi. | `IMPLEMENTED, PENDING PRODUCT DATA` |
| **P0-02** | **Kết quả tra cứu đơn hàng giả mạo (Fake Tracking)** | Form tra cứu dùng `event.preventDefault()` và hiển thị dòng chữ cố định *"In Transit with Express Carrier"*, không kết nối với bất kỳ API hoặc đơn hàng thực tế nào. | `FIXED & VERIFIED` |
| **P0-03** | **Form Contact không gửi được dữ liệu** | Form liên hệ dùng JavaScript `alert()` giả lập gửi tin nhắn thành công trong 24h mà không submit tới máy chủ Shopify. | `FIXED & VERIFIED` |
| **P0-04** | **Review và Testimonial khách hàng giả tạo** | Hardcoded đánh giá 4.9 sao (2,846 reviews) cùng 3 khách hàng giả mạo (Emily R., Nicole M., Jasmine T.) kèm avatar AI và huy hiệu "Verified Buyer" chưa kiểm chứng. | `FIXED & VERIFIED` |
| **P0-05** | **Tuyên bố công năng chưa được chứng minh phòng lab** | Các cam kết tuyệt đối như "100% leakproof", "cam kết 8-12 tiếng không tràn", "bền 50-100 lần giặt" xuất hiện khi nguyên mẫu vật lý V4 vẫn đang chờ kết quả kiểm định lab độc lập. | `FIXED & VERIFIED` (Copy Sanitized) / `PENDING PHYSICAL VALIDATION` (Lab Tests) |
| **P1-01** | **Icon Search trên Header làm rò rỉ sản phẩm legacy** | Header flagship có icon liên kết trực tiếp tới `/search` toàn site không lọc, khiến khách vào Ultra nhìn thấy sản phẩm cũ (Ear Cleaner, Tile Paint, v.v.). | `FIXED & VERIFIED` |
| **P1-02** | **Xung đột ngưỡng Free Shipping giữa Liquid và JS ($49 vs $70)** | Trong Liquid đặt ngưỡng flagship là $49.00 (4900 cents), nhưng JavaScript refresh cart drawer lại hardcode `const threshold = 7000;` ($70.00). | `FIXED & VERIFIED` |
| **P1-03** | **Cart rỗng bị rò rỉ link sang `/collections/all` sau khi refresh** | JavaScript re-render khi giỏ hàng trống tái tạo nút CTA trỏ về danh mục tổng `/collections/all`. | `FIXED & VERIFIED` |
| **P1-04** | **Newsletter ở Footer không lưu email khách hàng** | Form dùng `event.preventDefault()` và `alert()` popup mà không ghi nhận subscriber vào hệ thống Shopify Customer. | `FIXED & VERIFIED` |

---

## 2. DANH SÁCH FILE THAY ĐỔI (FILES CHANGED)

1. `sections/ultra-product-main.liquid` (P0-01, P0-04)
2. `assets/ultra-overnight.js` (P0-01)
3. `sections/ultra-reviews.liquid` (P0-04)
4. `sections/ultra-track-order.liquid` (P0-02)
5. `sections/ultra-contact.liquid` (P0-03)
6. `sections/ultra-header.liquid` (P1-01)
7. `sections/willa-cart-drawer.liquid` (P1-02, P1-03)
8. `sections/ultra-footer.liquid` (P1-04)
9. `sections/ultra-faq.liquid` (P0-05)
10. `sections/ultra-pdp-tabs.liquid` (P0-05)
11. `sections/ultra-about-story.liquid` (P0-05)
12. `templates/index.json` (Cập nhật settings tiêu đề chuẩn hóa)
13. `templates/product.ultra-overnight.json` (Cập nhật settings tiêu đề chuẩn hóa)
14. `docs/CLAIMS_REGISTER.md` (**Tạo mới**: Ma trận quản lý và chứng minh công năng)
15. `docs/ADMIN_ACTIVATION_MANIFEST.md` (**Tạo mới**: Cẩm nang thiết lập Shopify Admin cho thương nhân)
16. `.gitignore` (Bổ sung pattern bảo mật)
17. `package.json` (Loại bỏ mật khẩu plaintext trong script `dev`)
18. `scripts/verify_ultra_overnight_all.cjs` (Cập nhật script kiểm thử tự động toàn diện và bảo mật credentials)
19. `scripts/capture_all_qa.cjs`, `scripts/diagnose_preview.cjs`, `scripts/qa_tile_paint.cjs`, `scripts/verify_draft_preview.cjs` (Bảo mật credentials)
20. `docs/PHASE_3_COMPLETION_REPORT.md`, `docs/STORE_ARCHITECTURE.md` (Khử mã độc / mật khẩu plaintext)
21. `docs/backups/chat_session/transcript.jsonl`, `transcript_full.jsonl` (Sao lưu và loại bỏ toàn bộ token bảo mật)

---

## 3. CHI TIẾT CÁC BẢN SỬA MÃ NGUỒN (ACTUAL CODE FIXES)

### A. P0-01: Native Buy Box & Graceful Pending State
- **Liquid**: Liên kết với `all_products['full-spine-ultra-overnight']` hoặc `all_products['ultra-overnight']`. Kiểm tra biến cờ `has_real_product`.
  - Nếu sản phẩm thương mại chưa được tạo trong Shopify Admin: Buy box hiển thị badge và nút bấm trạng thái trung thực: `PRODUCT SETUP REQUIRED (PENDING ADMIN DATA)` ở chế độ `disabled="disabled"` và `aria-disabled="true"`.
  - Hiển thị thông báo hướng dẫn rõ ràng: *"Shopify Admin Action Required: Commercial product full-spine-ultra-overnight has not yet been published in Shopify Admin. Once created, live variants and checkout bind automatically."*
  - Tuyệt đối không fallback sang sản phẩm cũ (Ear Cleaner).
- **JavaScript (`assets/ultra-overnight.js`)**:
  - Hỗ trợ chọn Size / Variant options động thông qua option pills và dữ liệu JSON `uo-product-variants-json`.
  - Hỗ trợ chuyển đổi gói 1 Pair, 3 Pairs (Most Popular), 5 Pairs.
  - Khi chưa có variant ID hợp lệ: Chặn gửi request tới `/cart/add.js`, hiển thị thông báo lỗi rõ ràng trong khối `.uo-pdp-error-msg`, tuyệt đối không giả lập mở giỏ hàng.
  - Khi có variant ID hợp lệ: Gửi payload thật `{ id, quantity, properties: { 'Pack': tierName, 'Brand': 'ULTRA OVERNIGHT™' } }`, đồng bộ cart drawer qua `window.willaRefreshCart()` và mở drawer.

### B. P0-02: Khử Fake Tracking & Hướng dẫn tra cứu trung thực
- **`sections/ultra-track-order.liquid`**:
  - Loại bỏ hoàn toàn dòng thông báo giả mạo `In Transit with Express Carrier`.
  - Form tra cứu Order # và Email chuyển thành cổng điều hướng hỗ trợ chính thức:
    - Giải thích rõ ràng mã vận đơn thời gian thực được tự động gửi qua email thông báo giao hàng chính thức của Shopify.
    - Cung cấp nút liên kết tới tài khoản khách hàng `/account` để xem tiến độ thực tế.
    - Tự động tạo link gửi email trực tiếp tới bộ phận CSKH `support@trymalora.com` với tiêu đề và nội dung điền sẵn số đơn hàng của khách.

### C. P0-03: Chuyển đổi Contact Form sang Shopify Native Liquid
- **`sections/ultra-contact.liquid`**:
  - Thay thế `onsubmit="event.preventDefault(); alert(...)"` bằng thẻ native `{% form 'contact', id: 'uoContactForm', class: 'uo-contact-form' %}`.
  - Tích hợp xử lý trạng thái chuẩn Shopify: banner thành công `form.posted_successfully?` và hiển thị lỗi `form.errors`.
  - Các trường bắt buộc đầy đủ: Name, Email, Body, kèm trường Order Number tùy chọn, nhãn tiếp cận WCAG và email hỗ trợ chính thức `support@trymalora.com`.

### D. P0-04: Khử Fake Reviews & Chuyển đổi sang Editorial Standards
- **`sections/ultra-product-main.liquid`**: Loại bỏ dòng đánh giá giả 4.9 sao / 2,846 reviews. Chỉ hiển thị khi có dữ liệu metafield đánh giá thực tế `product.metafields.reviews.rating.value`.
- **`sections/ultra-reviews.liquid`**:
  - Loại bỏ toàn bộ tên khách hàng, avatar và badge "Verified Buyer" giả.
  - Chuyển thành khối giới thiệu tiêu chuẩn chế tác cao cấp: **Design Standard 01 (Full-Spine™ Architecture)**, **Sensory Standard 02 (CloudFlex™ Soft Touch)**, và **Longevity Standard 03 (WashGuard™ Durability)**.
  - Tích hợp sẵn setting schema `enable_review_app` và `review_app_snippet` để chủ cửa hàng nhúng ứng dụng đánh giá thật (Judge.me, Loox, v.v.) khi bắt đầu thu thập review thực tế.

### E. P0-05: Rà soát & Chuẩn hóa tuyên bố công năng (Claims Register)
- Rà soát các file `ultra-faq.liquid`, `ultra-pdp-tabs.liquid`, `ultra-about-story.liquid`.
- Thay thế các khẳng định tuyệt đối chưa kiểm định ("100% leakproof", "8-12 hours", "50-100 cycles") bằng ngôn ngữ thiết kế chuẩn xác ("designed for heavy-flow days and nights", "engineered for repeated wash cycles when cared for as directed").
- Thiết lập tài liệu pháp lý kỹ thuật `docs/CLAIMS_REGISTER.md`.

### F. P1-01: Ngăn chặn rò rỉ sản phẩm cũ qua Search
- Loại bỏ icon Search trên Header flagship (`sections/ultra-header.liquid`) theo Phương án A an toàn nhất. Khách hàng điều hướng tự nhiên trên Ultra không bị rò rỉ sang catalog cũ.

### G. P1-02 & P1-03: Đồng bộ ngưỡng Free Shipping và Cart rỗng
- **`sections/willa-cart-drawer.liquid`**:
  - Gắn biến cờ ngữ cảnh toàn cục `window.__isUltraContext = !is_legacy_product;`.
  - JavaScript tự động nhận diện: nếu ở ngữ cảnh Ultra, ngưỡng free shipping là $49.00 (4900 cents); nếu ở ngữ cảnh sản phẩm cũ (Ear Cleaner, Tile Paint, v.v.), ngưỡng là $70.00 (7000 cents).
  - Khắc phục lỗi làm tròn số thập phân.
  - Khi giỏ hàng trống: JavaScript tái tạo nút trỏ về `/products/full-spine-ultra-overnight` (hoặc `/` cho legacy), **tuyệt đối không trỏ về `/collections/all`**.

### H. P1-04: Native Newsletter Form
- **`sections/ultra-footer.liquid`**:
  - Thay thế popup alert bằng native `{% form 'customer', class: 'uo-newsletter-form' %}`.
  - Gắn tag định danh khách hàng `newsletter,ultra-overnight`.
  - Xử lý trạng thái thành công và hiển thị lỗi email chuẩn xác.

---

## 4. XÁC NHẬN KIỂM ĐỊNH DRAFT THEME (DRAFT THEME VERIFICATION)

Đã triển khai thành công 44/44 file mã nguồn và asset lên Draft Theme **197625381235** thông qua Shopify Theme API:
- **Draft Theme ID**: `197625381235`
- **Tên Theme**: `ULTRA OVERNIGHT — PREMIUM FEMININE V1 — DRAFT`
- **Trạng thái**: `unpublished`
- **URL xem trước**: [https://ikwh1h-fx.myshopify.com/?preview_theme_id=197625381235](https://ikwh1h-fx.myshopify.com/?preview_theme_id=197625381235)

---

## 5. XÁC NHẬN TRẠNG THÁI LIVE THEME (LIVE THEME UNTOUCHED)

Đã thẩm định thông qua endpoint `admin/api/2024-01/themes.json`:
- **Live Theme ID**: `197144805747`
- **Tên Theme**: `TRYMALORA — NEW PRODUCTS V1 — DRAFT`
- **Role**: `main` (Live)
- **Thời gian cập nhật lần cuối**: `2026-11-11T23:18:00-08:00` (**Không bị thay đổi, giữ nguyên 100%**)

---

## 6. ĐÁNH GIÁ ĐỘ SẴN SÀNG CỦA SHOPIFY ADMIN DATA

Kiểm tra đối tượng thực tế trên Shopify Admin:
- **Sản phẩm Ultra thương mại**: Chưa tồn tại sản phẩm với handle `full-spine-ultra-overnight`. Do đó, buy box được cấu hình ở trạng thái chờ kích hoạt hợp lệ (`IMPLEMENTED, PENDING PRODUCT DATA`).
- **Trang nội dung**:
  - `/pages/contact`: Đã tồn tại, hiển thị hoàn hảo form contact native.
  - `/pages/about-us`, `/pages/track-order`, `/pages/faq`: Cần tạo record trên Shopify Admin theo hướng dẫn trong `docs/ADMIN_ACTIVATION_MANIFEST.md`.

---

## 7. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST RESULTS)

| Tên bộ kiểm thử | Phạm vi kiểm tra | Kết quả | Chi tiết thực thi |
|---|---|---|---|
| **`test_qa_ultra_isolation.py`** | 4 bài test cô lập catalog và route legacy | **PASS (4/4)** | 0.063s, không có hồi quy logic |
| **`qa_ultra_isolation.py audit`** | Kiểm toán tĩnh 50 file giao diện | **PASS** | 0 critical legacy PDP drift |
| **JSON Schema Check** | Toàn bộ template JSON trong `templates/` & `sections/` | **PASS** | 100% tệp JSON hợp lệ |
| **Headless Chrome E2E QA** | 10 bước kiểm thử tương tác thực tế và chụp ảnh màn hình | **PASS (10/10)** | Toàn bộ assertion giao diện đạt chuẩn |

---

## 8. KẾT QUẢ KIỂM THỬ HỒI QUY SẢN PHẨM CŨ (LEGACY AD REGRESSION)

Kiểm thử trên 3 phễu quảng cáo trực tiếp thông qua Draft Preview:
1. **/products/ear-cleaner**:
   - Header: Willa Header hiển thị đúng (`hasUltraHeader: false`).
   - Bundle Cards: 3 gói hoạt động bình thường (`hasBundles: 3`).
   - Nút Add to Cart: Hoạt động trơn tru.
2. **/products/eyvelle-steam-therapy**:
   - Header: Willa Header hiển thị đúng (`hasUltraHeader: false`).
   - Bundle Cards: 3 gói hoạt động chuẩn xác (`hasBundles: 3`).
   - Nút Add to Cart: Hoạt động trơn tru.
3. **/products/metallic-silver-anti-rust-renovation-coating**:
   - Header: Willa Header hiển thị đúng (`hasUltraHeader: false`).
   - Bundle Cards: 3 gói hoạt động chuẩn xác (`hasBundles: 3`).
   - Nút Add to Cart: Hoạt động trơn tru.

**Kết luận**: Bảo vệ tuyệt đối 100% các phễu quảng cáo cũ.

---

## 9. CÁC ĐIỂM CHẶN VẬN HÀNH CẦN HOÀN THÀNH (OPERATIONAL BLOCKERS)

1. **`BLOCKED BY ADMIN CONFIGURATION`**: Tạo sản phẩm thương mại `full-spine-ultra-overnight` và các trang `/pages/about-us`, `/pages/track-order`, `/pages/faq` trên Shopify Admin.
2. **`PENDING PHYSICAL VALIDATION`**: Hoàn thành kết quả thử nghiệm độ thấm hút (150-160ml) và độ bền chu kỳ giặt từ phòng kiểm nghiệm độc lập trước khi chạy quảng cáo khẳng định số liệu.

---

## 10. XỬ LÝ VẤN ĐỀ BẢO MẬT (SECURITY REMEDIATION)

- Đã loại bỏ hoàn toàn mật khẩu storefront plaintext (`lompea`) khỏi script npm `dev` trong `package.json`, các script kiểm thử `.cjs`, và các tài liệu markdown.
- Các script tự động nạp cấu hình qua biến môi trường hoặc tệp `.env` cục bộ (được bảo vệ bởi `.gitignore`).
- Đã quét và khử toàn bộ Shopify access token, app secret và CLI session payload trong thư mục sao lưu `docs/backups/chat_session/`.
- Không in hoặc để lộ bất kỳ khóa bảo mật nào trong log hay báo cáo.

---

## 11. THÔNG TIN GIT VÀ GITHUB

- **Commit SHA**: `813d6f1ae06211e2ffbfe2422f0fcb183f305675`
- **Branch**: `feat/ultra-overnight-premium-storefront`
- **Remote Push**: Thành công lên `origin/feat/ultra-overnight-premium-storefront`
- **GitHub Repository**: [https://github.com/DarkTutemi/TRYMALORA](https://github.com/DarkTutemi/TRYMALORA)

---

## 12. LINK XEM TRƯỚC DRAFT THEME
- **Draft Preview**: [https://ikwh1h-fx.myshopify.com/?preview_theme_id=197625381235](https://ikwh1h-fx.myshopify.com/?preview_theme_id=197625381235)

---

## 13. HÌNH ẢNH THẨM ĐỊNH THỰC TẾ (SCREENSHOTS)

Các ảnh chụp màn hình kiểm định mới nhất từ trình duyệt headless Chrome:
- **Desktop Homepage**: [qa_ultra_desktop_home.png](file:///C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_ultra_desktop_home.png)
- **Mobile Homepage**: [qa_ultra_mobile_home.png](file:///C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_ultra_mobile_home.png)
- **Desktop PDP (Buy Box & Tiers)**: [qa_ultra_desktop_pdp.png](file:///C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_ultra_desktop_pdp.png)
- **Mobile PDP**: [qa_ultra_mobile_pdp.png](file:///C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_ultra_mobile_pdp.png)
- **Contact Us (Native Form)**: [qa_ultra_contact.png](file:///C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_ultra_contact.png)
- **Track Order (Honest Guidance)**: [qa_ultra_track_order.png](file:///C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_ultra_track_order.png)
- **FAQ Page**: [qa_ultra_faq.png](file:///C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_ultra_faq.png)
- **Cart Drawer ($49 Threshold & Isolated Empty CTA)**: [qa_ultra_cart_drawer.png](file:///C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_ultra_cart_drawer.png)
- **Legacy Ear Cleaner Funnel**: [qa_legacy_ear_cleaner.png](file:///C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_legacy_ear_cleaner.png)
- **Legacy Steam Therapy Funnel**: [qa_legacy_steam_therapy.png](file:///C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_legacy_steam_therapy.png)
- **Legacy Silver Coating Funnel**: [qa_legacy_silver_coating.png](file:///C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_legacy_silver_coating.png)

---

## 14. BẢNG HƯỚNG DẪN THIẾT LẬP SHOPIFY ADMIN CỤ THỂ (ADMIN ACTIVATION MANIFEST)
Chi tiết đầy đủ đã được lưu trữ tại [docs/ADMIN_ACTIVATION_MANIFEST.md](file:///c:/Users/Admin/Desktop/TRYMALORA/docs/ADMIN_ACTIVATION_MANIFEST.md):
1. **Tạo sản phẩm**:
   - Tiêu đề: `FULL-SPINE ULTRA OVERNIGHT™ — Period Underwear`
   - Handle: `full-spine-ultra-overnight`
   - Template suffix: `ultra-overnight`
   - Options: `Size` (XS–3XL), `Color` (Plum Noir, Blush Rose)
   - Đơn giá cơ sở: $28.00 USD
2. **Tạo 3 trang**:
   - `/pages/about-us` (template suffix: `about-us`)
   - `/pages/track-order` (template suffix: `track-order`)
   - `/pages/faq` (template suffix: `faq`)
3. **Cài đặt mức phí vận chuyển**:
   - Thiết lập cấu hình Free Shipping cho đơn từ $49.00 USD trong Shopify Shipping Settings.
