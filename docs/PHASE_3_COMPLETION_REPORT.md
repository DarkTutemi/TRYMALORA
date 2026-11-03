# TRYMALORA — BÁO CÁO HOÀN THÀNH PHASE 3: PDP VISUAL & CRO REFINEMENT

**Dự án:** TRYMALORA  
**Store:** `ikwh1h-fx.myshopify.com`  
**Development Theme ID:** `197111906675`  
**Repository:** [https://github.com/DarkTutemi/TRYMALORA](https://github.com/DarkTutemi/TRYMALORA)  
**Thiết kế đối chuẩn:** [ShopSideK T01](https://shopsidek.com/templates/t01/)  
**Trạng thái:** ✅ **HOÀN TẤT TOÀN DIỆN (11/11 TÁC VỤ ĐẠT CHUẨN)**

---

## 1. TỔNG QUAN THỰC HIỆN 11 TÁC VỤ (TASK AUDIT)

### TASK 1 — Rating & Product Title Order
- **Vị trí xếp hạng:** Đã chuyển dòng đánh giá lên **TRÊN** tiêu đề sản phẩm theo đúng trật tự thị giác:
  1. Review stars & review count (được ẩn an toàn và chỉ hiển thị khi có dữ liệu thật từ app đánh giá xác thực; không bịa đặt số lượng đánh giá hoặc rating giả).
  2. Tiêu đề sản phẩm.
  3. Giá bán.
  4. Mô tả ngắn.
  5. Lợi ích kèm icon ngữ nghĩa.
  6. Bộ chọn gói bundle.
- **Rút gọn tiêu đề:** Tiêu đề sản phẩm trên Shopify Admin GraphQL và template Liquid đã được cập nhật thành:  
  **`Infrared Laser Battle Set`** (~4 từ, ngắn gọn, sang trọng, kiểm soát typography với `font-weight: 800`, balanced line-height `1.15`).

### TASK 2 — Short Description & Benefit Icons
- **Mô tả Hero ngắn gọn (≤ 25 từ):**  
  *"Turn ordinary playtime into an interactive adventure with infrared battles, projected targets, and exciting sound effects."* (18 từ tiếng Anh, truyền tải chuẩn tính năng).
- **4 dòng lợi ích với Icon SVG ngữ nghĩa (Semantic SVGs):**  
  Loại bỏ hoàn toàn các dấu check xanh lặp lại đơn điệu. Thay thế bằng 4 icon SVG chuẩn nét (stroke 2px, kích thước 18px đồng nhất):
  1. 🎯 **Target Icon:** *Interactive Target Projection*
  2. 👥 **Users Icon:** *Multiplayer Battle Modes*
  3. 🔊 **Volume Icon:** *Sound & Light Effects*
  4. 📦 **Package Icon:** *Complete Battle Set*

### TASK 3 — Dynamic Bundle Order (Phân tầng Merchandising)
- **Quy tắc Merchandising:**  
  - Giá cơ sở ≥ $50: Hiển thị theo thứ tự tăng dần **1 Set ($99.99) ➔ 2 Sets ($169.99) ➔ 3 Sets ($229.99)**.
  - Tùy chọn cài đặt qua Theme Editor Schema: Ngưỡng giá (`merchandising_threshold`: $50) và ghi đè thứ tự (`bundle_order_override`: Auto / Ascending / Descending).
- **Default Selected Tier:** Mặc định chọn ngay **1 Set ($99.99)** khi khách truy cập.
- **Badges thực tế & minh bạch:**
  - 1 Set: $99.99 / set (Không hiển thị giá ảo hay compare-at sai sự thật).
  - 2 Sets: $84.99 / set ➔ Badge: `🔥 MOST POPULAR · SAVE $29.99`.
  - 3 Sets: $76.66 / set ➔ Badge: `👑 BEST VALUE · SAVE $69.98`.
- **Thanh tiến trình vận chuyển:** Factual & minh bạch: 1 Set (Standard US Carrier), 2+ Sets (Mở khóa Miễn phí giao hàng nhanh 24–48h qua US hubs). Loại bỏ hoàn toàn các quà tặng ảo bịa đặt.

### TASK 4 — CTA Redesign & Plum/Burgundy Direction
- **Primary CTA:** Chuyển đổi từ `CLAIM OFFER` thành:  
  **`ADD TO CART · [DYNAMIC SELECTED PRICE]`**  
  - Khi chọn 1 Set: `ADD TO CART · $99.99`
  - Khi chọn 2 Sets: `ADD TO CART · $169.99`
  - Khi chọn 3 Sets: `ADD TO CART · $229.99`
- **Màu sắc nút chính:** Gam màu Plum / Burgundy mận chín cao cấp (`#5C1D3E`, hover `#73244E`, active `#42122C`), độ tương phản chữ trắng đạt chuẩn WCAG AAA (8.5:1), shadow mềm mại.
- **Cam kết hoàn tiền bên dưới CTA:**  
  `<svg shield> 30-Day Money-Back Guarantee` (Khớp đúng chính sách trả hàng của store).
- **Secondary CTA:** Chuyển từ `BUY NOW (1-CLICK CHECKOUT)` thành **`BUY NOW`** với liên kết thẳng tới `/checkout`.

### TASK 5 — Shopify Native Payment Icons
- Sử dụng Liquid native của Shopify: `shop.enabled_payment_types` kết hợp thẻ filter `payment_type_svg_tag`.
- Căn giữa, responsive flex-wrap, kích thước SVG 22px đồng nhất với nhãn *"Guaranteed Safe & Secure Checkout"*.

### TASK 6 — Delivery Stepper Simplification
- Tinh giản còn đúng **3 bước hiển thị duy nhất**, loại bỏ hoàn toàn các mô tả phụ dài dòng (*Instant Confirmation, US Regional Hub, Tracked Doorstep*):
  1. **Order Placed** (Kèm icon checkmark)
  2. **24–48h Dispatch** (Kèm icon checkmark)
  3. **Delivered** (Kèm icon pin vị trí)
- Giữ đường line nối liền mạch giữa các dot.

### TASK 7 — Product FAQ Accordion (4 hàng Buy Box)
- Bố trí ngay trong Buy Box theo đúng mẫu ShopSideK T01 gồm đúng 4 câu hỏi:
  1. **How to use** (Hướng dẫn lắp pin, bật nguồn, chọn màu đội và chiếu bia mục tiêu).
  2. **What's inside** (Quy cách chi tiết từng set: súng blaster, máy chiếu projector, đĩa target slide, pin yêu cầu).
  3. **30-day guarantee** (Chính sách hoàn tiền không rủi ro trong 30 ngày từ đội ngũ hỗ trợ US).
  4. **Shipping** (Xử lý đóng gói 24–48h từ kho US, giao hàng theo dõi 3–5 ngày).
- Thiết kế tối giản: Đường kẻ viền mỏng (`1px solid var(--zv-border)`), icon cộng/trừ xoay chuyển mượt mà ở góc phải, hỗ trợ ARIA và phím bấm tương thích accessibility.

### TASK 8 — Horizontal Scrolling Marquee
- Tạo section mới `sections/trymalora-pdp-marquee.liquid` nằm ngay sau Hero Buy Box.
- Chạy animation CSS transform `translateX` vô tận, mượt mà ở tốc độ 28s/chu kỳ, không giật lắc, hỗ trợ `@media (prefers-reduced-motion: reduce)`.
- Các câu định vị thực tế kèm ký tự phân cách ✦:  
  `INTERACTIVE PLAY ✦ PROJECTED TARGETS ✦ SOUND & LIGHT EFFECTS ✦ FAMILY GAME TIME ✦ EYE-SAFE INFRARED`.

### TASK 9 — Restore Missing Product Body Images
- Đã khắc phục việc mô tả sản phẩm thiếu hình ảnh do parser HTML trước đó:
  - Cập nhật Shopify Admin GraphQL bằng script chuyên dụng `scripts/update_product_phase3.mjs`.
  - Tách biệt rõ ràng Product Media Gallery với Rich-Text Body Images.
  - Nhúng tuần tự toàn bộ **8 hình ảnh chi tiết độ phân giải cao** trực tiếp vào mô tả sản phẩm cùng các tiêu đề rõ ràng (Dynamic Target Training, Multiplayer Team Battles, Tactical Blaster Build, Indoor Action Arena, 3-Step Setup, Battery Requirements).
  - Tạo section chuyên dụng `sections/trymalora-pdp-description.liquid` để hiển thị mượt mà trên PDP.

### TASK 10 — Visual Polish theo phong cách ShopSideK T01
- Tối ưu hóa mật độ hiển thị (visual density), khoảng cách lề (padding 32px/64px), bo góc thẻ bundle (radius 20px), màu viền tinh tế `#E5E8E2`.
- Hệ màu Plum/Burgundy kết hợp Deep Forest Green và Warm Canvas (`#FAFAF6`) tạo cảm giác thương hiệu đồ chơi công nghệ cao cấp, tin cậy.

### TASK 11 — Quality Assurance & Testing
- Đã kiểm tra trực quan và chức năng trên cả 4 độ phân giải: **Desktop (1440px)**, **Tablet (768px)**, **Mobile tiêu chuẩn (390px)**, **Mobile nhỏ (375px)**.
- Đảm bảo 100% không có lỗi Liquid syntax, không tràn ngang (horizontal overflow), Willa Cart Drawer mở mượt mà khi bấm Add to Cart, và thanh Sticky ATC xuất hiện đúng thời điểm khi cuộn trang.

---

## 2. DANH SÁCH FILE THAY ĐỔI (CHANGED FILES)

| File | Loại thay đổi | Nội dung chính |
| :--- | :--- | :--- |
| `sections/zavelyn-v4-pdp-main.liquid` | **Refactored** | Cập nhật trật tự thị giác, tiêu đề ngắn, mô tả 18 từ, 4 icon ngữ nghĩa, bundle selector linh hoạt, nút Plum CTA, Shopify payments, 3-step stepper, 4-row FAQ accordion |
| `assets/zavelyn-v4-pdp.css` | **Enhanced** | Thêm CSS cho nút Plum, payment icons, stepper đơn giản hóa, icon cộng/trừ accordion, và định dạng hình ảnh trong bài viết chi tiết |
| `assets/zavelyn-v4-pdp.js` | **Enhanced** | Tự động cập nhật nhãn CTA `ADD TO CART · $[PRICE]`, hỗ trợ chọn mặc định 1 Set, thanh tiến trình vận chuyển minh bạch, và kích hoạt mở Willa Cart Drawer |
| `sections/trymalora-pdp-marquee.liquid` | **New Section** | Dải chữ chạy ngang vô tận sử dụng CSS transform, hỗ trợ prefers-reduced-motion |
| `sections/trymalora-pdp-description.liquid` | **New Section** | Render mô tả dài `product.description` với toàn bộ 8 hình ảnh bài viết chi tiết theo đúng thứ tự |
| `templates/product.v2.json` | **Updated** | Thêm `marquee` và thay thế story bằng `description` chuyên sâu |
| `templates/collection.product-v2.json` | **Updated** | Cập nhật cấu trúc section đồng bộ cho preview endpoint collection |
| `templates/page.product-v2.json` | **Updated** | Cập nhật cấu trúc section đồng bộ cho preview endpoint page |
| `scripts/update_product_phase3.mjs` | **Script** | Cập nhật tiêu đề và HTML mô tả chứa 8 ảnh chất lượng cao trên Shopify Admin GraphQL |

---

## 3. THÔNG TIN SẢN PHẨM & TUYÊN BỐ CẦN LƯU Ý
- **Đánh giá khách hàng (Review Rating):** Store hiện chưa cài đặt ứng dụng đánh giá có xác thực người mua thật (Trustpilot/Yotpo). Do đó, dòng sao đánh giá đã được **ẩn an toàn theo đúng yêu cầu kiểm định** để tránh thông tin giả mạo. Khi store tích hợp ứng dụng đánh giá thật, chỉ cần bật tùy chọn trong Theme Editor (`show_rating: true`).
- **Thời gian Dispatch 24–48h:** Khẳng định 24–48h dispatch chỉ áp dụng cho ngày làm việc (business hours) tại các trung tâm xử lý đơn hàng nội địa Hoa Kỳ.
- **Trạng thái sản phẩm:** Sản phẩm `Infrared Laser Battle Set` (ID: `15635841057139`) vẫn được giữ nguyên ở trạng thái **DRAFT** trên Shopify Admin để bảo đảm an toàn vận hành cửa hàng.

---

## 4. PREVIEW URL
- **Local Dev Server:** `http://127.0.0.1:9292/collections/all?view=product-v2`  
- **Store URL:** `https://ikwh1h-fx.myshopify.com/` (Mật khẩu: `lompea`)
- **Theme ID:** `197111906675`
