# BÁO CÁO HOÀN THÀNH TRIỂN KHAI GIAI ĐOẠN 2 (PHASE 2) — TRYMALORA

> **Cửa hàng**: `ikwh1h-fx.myshopify.com`  
> **Theme Phát Triển (Development Theme ID)**: `197111906675`  
> **Repository GitHub**: [https://github.com/DarkTutemi/TRYMALORA](https://github.com/DarkTutemi/TRYMALORA)  
> **Ngày hoàn thành**: 03/11/2026  
> **Trạng thái**: Hoàn thành 100% tất cả 6 nhiệm vụ được phê duyệt  

---

## 1. Danh Sách Tệp Đã Tạo & Chỉnh Sửa

### Tệp Tạo Mới
- [`templates/product.v2.json`](file:///c:/Users/Admin/Desktop/TRYMALORA/templates/product.v2.json): Template trang sản phẩm chuẩn OS 2.0 V2, tích hợp đầy đủ 7 section chuẩn CRO.
- [`templates/page.product-v2.json`](file:///c:/Users/Admin/Desktop/TRYMALORA/templates/page.product-v2.json): Template trang tĩnh phục vụ xem trước độc lập.
- [`templates/collection.product-v2.json`](file:///c:/Users/Admin/Desktop/TRYMALORA/templates/collection.product-v2.json): Template bộ sưu tập dùng xem trước Product V2 trên môi trường dev.
- [`sections/trymalora-pdp-package.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/trymalora-pdp-package.liquid): Section "What's in the Box" với thẻ trực quan và cảnh báo minh bạch về pin.
- [`sections/trymalora-pdp-how-it-works.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/trymalora-pdp-how-it-works.liquid): Section 2 chế độ chơi (Bắn bia máy chiếu vs Đấu đội đối kháng) và quy trình 3 bước khởi động.
- [`sections/trymalora-pdp-specs.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/trymalora-pdp-specs.liquid): Bảng thông số kỹ thuật chi tiết, an toàn quang học hồng ngoại không gây hại mắt.
- [`sections/trymalora-pdp-faq.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/trymalora-pdp-faq.liquid): Accordion giải đáp thắc mắc về độ an toàn, số người chơi, pin và chính sách bảo hành.
- [`scripts/create_first_product.mjs`](file:///c:/Users/Admin/Desktop/TRYMALORA/scripts/create_first_product.mjs): Script tự động tạo sản phẩm DRAFT qua GraphQL với đầy đủ 8 hình ảnh và 3 biến thể giá.
- [`scripts/add_bundle_variants.mjs`](file:///c:/Users/Admin/Desktop/TRYMALORA/scripts/add_bundle_variants.mjs): Script cấu hình 3 biến thể gói bundle chuẩn Shopify ($99.99, $169.99, $229.99).
- [`scripts/auto_collection_assign.mjs`](file:///c:/Users/Admin/Desktop/TRYMALORA/scripts/auto_collection_assign.mjs): Bộ phân loại tự động sản phẩm vào bộ sưu tập có cơ chế chống trùng lặp.

### Tệp Chỉnh Sửa
- [`sections/header-group.json`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/header-group.json): Dọn dẹp toàn bộ link hỏng, cập nhật tên thương hiệu TRYMALORA, trỏ link menu đến Home, Interactive Toys, 2.5D Showroom và Catalog.
- [`sections/willa-header.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/willa-header.liquid): Đổi tên thương hiệu mặc định sang TRYMALORA, cấu hình fallback menu sạch lỗi 404.
- [`sections/zavelyn-v4-stores.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/zavelyn-v4-stores.liquid): Sửa 4 cổng dịch chuyển showroom trỏ về link hợp lệ (`/collections/interactive-toys?view=showroom`).
- [`sections/willa-cart-drawer.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/willa-cart-drawer.liquid): Sửa nút mua hàng khi giỏ trống trỏ về `/collections/all` (HTTP 200).
- [`sections/zavelyn-v4-pdp-main.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/zavelyn-v4-pdp-main.liquid): Nâng cấp toàn diện Hero Buy Box theo phong cách ShopSideK T01: Kaching 3-tier bundle selector, tính năng tiết kiệm toán học thực tế, thanh quyền lợi vận chuyển, delivery stepper, accordions 30 ngày dùng thử, sticky mobile bar.
- [`sections/zavelyn-v4-showroom.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/zavelyn-v4-showroom.liquid): Bổ sung nhận diện kệ phong cách Tech cho danh mục đồ chơi tương tác và trưng bày sản phẩm mới lên kệ vật lý 2.5D.
- [`sections/zavelyn-pdp-shipping.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/zavelyn-pdp-shipping.liquid): Chuẩn hóa thương hiệu TRYMALORA và cam kết 30 ngày hoàn tiền không rủi ro.
- [`assets/zavelyn-v4-pdp.js`](file:///c:/Users/Admin/Desktop/TRYMALORA/assets/zavelyn-v4-pdp.js): Tự động nhận diện Variant ID theo gói bundle được chọn, tính toán giá/unit, kích hoạt Willa Cart Drawer và 1-click Direct Checkout.
- [`scripts/config.mjs`](file:///c:/Users/Admin/Desktop/TRYMALORA/scripts/config.mjs): Tích hợp phiên đăng nhập CLI tự động và hàm helper `adminGraphql()`.

---

## 2. Liên Kết Quan Trọng (URLs)

| Hạng mục | Đường dẫn (URL) | Trạng thái |
| :--- | :--- | :--- |
| **Sản phẩm Draft Admin** | `https://admin.shopify.com/store/ikwh1h-fx/products/15635841057139` | **DRAFT (Chưa xuất bản)** |
| **Xem trước sản phẩm Draft** | `https://ikwh1h-fx.myshopify.com/products/kids-infrared-battle-blaster-set-with-target-projector?preview_theme_id=197111906675` | Template: `v2` |
| **Bộ sưu tập Admin** | `https://admin.shopify.com/store/ikwh1h-fx/collections/708633461107` | **Interactive Toys** |
| **Xem trước bộ sưu tập** | `https://ikwh1h-fx.myshopify.com/collections/interactive-toys?preview_theme_id=197111906675` | Template: `showroom` (Tech) |
| **Preview Môi trường Dev** | `http://127.0.0.1:9292` | Đang phục vụ cục bộ |
| **Trang Product V2 Preview** | `http://127.0.0.1:9292/collections/all?view=product-v2` | HTTP 200 OK |
| **Showroom 2.5D Preview** | `http://127.0.0.1:9292/collections/all?view=showroom` | HTTP 200 OK |

---

## 3. Cấu Hình Giá & Gói Bundle (Đã Xác Minh Khớp 100% Giỏ Hàng)

Tất cả 3 gói được tạo thành 3 biến thể (variants) thực thụ trên Shopify, đảm bảo khi khách hàng chọn bất kỳ gói nào, số tiền tính tại trang thanh toán (Shopify Checkout) khớp chính xác:

| Gói Bundle | Tên Biến Thể Trên Shopify | Variant ID | Giá Bán Thật | So Sánh Gốc (1-Set Multiplier) | Tiết Kiệm | Giá Mỗi Bộ (Unit Price) | Quyền Lợi Kèm Theo |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Tier 1** | 1 Set (Starter Battle Pack) | `67297621934451` | **$99.99** | $99.99 | Tiêu chuẩn | $99.99 / bộ | 2 Súng + 1 Máy chiếu + Đĩa bia |
| **Tier 2** | 2 Sets (Duo Team Pack) | `67297622131059` | **$169.99** | $199.98 | **Tiết kiệm $29.99** | $85.00 / bộ | 4 Súng + 2 Máy chiếu + Miễn phí Ship US |
| **Tier 3** | 3 Sets (Family Arena Pack) | `67297622163827` | **$229.99** | $299.97 | **Tiết kiệm $69.98** | $76.66 / bộ | 6 Súng + 3 Máy chiếu + Ship Hỏa Tốc VIP |

*Cam kết minh bạch: Không sử dụng giá so sánh ảo, không hứa hẹn quà tặng chưa xác nhận nguồn hàng, giá trị tiết kiệm tính trực tiếp từ giá mua lẻ từng bộ.*

---

## 4. Kết Quả Kiểm Thử Toàn Diện (QA Test Results)

1. **Shopify Theme Check**: Vượt qua thành công, 0 lỗi cú pháp hoặc schema trên toàn bộ các file mới.
2. **Product Gallery Interaction**: Thumbnail strip 6 ảnh HD hoạt động mượt mà; click ảnh nào ảnh chính cập nhật ngay ảnh đó.
3. **Kaching 3-Tier Bundle Engine**: Chuyển đổi giữa 3 gói tính toán lại giá chính, giá so sánh, số tiền tiết kiệm và cập nhật trạng thái thanh mở khóa quyền lợi vận chuyển lập tức.
4. **Willa Cart Drawer Sync**: Nhấp nút `"CLAIM OFFER ➔"` gửi API thêm đúng Variant ID tương ứng vào Shopify Cart và mở Willa Cart Drawer từ bên phải màn hình.
5. **Direct 1-Click Checkout**: Nút `"⚡ BUY NOW"` thêm sản phẩm vào giỏ và tự động điều hướng sang trang `/checkout`.
6. **2.5D Showroom Tech Shelf**: Kệ vật lý Tech Shelf hiển thị đồ họa súng laser với bóng đổ tiếp xúc (contact shadow) chân thực, price tag hiển thị giá $99.99 và nút Add to Cart trực tiếp tại kệ.
7. **Mobile Responsiveness**: Tại màn hình điện thoại (390x844), thanh Sticky Mobile Add-to-Cart bar (`#zvStickyBar`) tự động hiện lên khi cuộn qua Buy Box với tên sản phẩm, giá gói hiện tại và nút CTA.
8. **Broken Links Check**: Không còn bất kỳ đường link nào báo lỗi 404 trong header, mobile menu, hay footer.

---

## 5. Ảnh Chụp Màn Hình Minh Chứng (Screenshots)

- **Desktop Product Page V2**:
  `C:\Users\Admin\.gemini\antigravity-ide\brain\d284d670-0cfd-4f12-bbed-f8eeaea36551\desktop_pdp_1793696580855.png`
- **Desktop Bundle & Gallery Interaction**:
  `C:\Users\Admin\.gemini\antigravity-ide\brain\d284d670-0cfd-4f12-bbed-f8eeaea36551\desktop_pdp_updated_1793696621545.png`
- **Willa Cart Drawer Slide-out**:
  `C:\Users\Admin\.gemini\antigravity-ide\brain\d284d670-0cfd-4f12-bbed-f8eeaea36551\cart_drawer_check_1793696697203.png`
- **Mobile Sticky Add to Cart Bar (390x844)**:
  `C:\Users\Admin\.gemini\antigravity-ide\brain\d284d670-0cfd-4f12-bbed-f8eeaea36551\mobile_sticky_bar_1793696746272.png`

---

## 6. Các Điểm Cần Chủ Cửa Hàng Xác Nhận Trước Khi Publish Chính Thức

1. **Xuất bản Kênh Bán Hàng (Sales Channel)**:
   Để tuân thủ nghiêm ngặt chỉ thị *"Keep unapproved products and collections unpublished"*, sản phẩm đang ở trạng thái **DRAFT** và collection `Interactive Toys` chưa gán kênh Online Store. Khi sẵn sàng ra mắt chính thức, chủ store chỉ cần bấm xuất bản trong Admin Shopify.
2. **Kế hoạch Cross-sell / Upsell Pin (Batteries)**:
   Bộ sản phẩm yêu cầu 4 pin AAA và 3 pin AA (không kèm sẵn trong hộp). Khuyến nghị chủ store cân nhắc bổ sung sản phẩm gói pin Duracell/Energizer làm bump offer trong giỏ hàng để gia tăng AOV và trải nghiệm khách hàng.
3. **Địa điểm kho vận & thời gian vận chuyển thực tế**:
   Hiện trang sản phẩm đang để mốc chuẩn kho US: xử lý 24–48h và giao hàng 3–5 ngày làm việc. Nếu sử dụng nhà cung cấp 3PL khác, cần điều chỉnh lại văn bản cho khớp chính xác với hợp đồng fulfillment.
