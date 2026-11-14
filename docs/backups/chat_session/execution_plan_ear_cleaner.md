# KẾ HOẠCH TRIỂN KHAI CLONE SẢN PHẨM EAR CLEANER — TRYMALORA

> **Sản phẩm nguồn:** [amblora.com/products/ear-cleaner](https://amblora.com/products/ear-cleaner)  
> **Cửa hàng đích:** `ikwh1h-fx.myshopify.com` (`trymalora.com`)  
> **Handle:** `ear-cleaner`  
> **Áp dụng Theme:** Live Theme `#197144805747` & Draft Theme `#197111513459`  

---

## 1. CẤU HÌNH SẢN PHẨM & BUNDLE MỚI

Theo đúng yêu cầu của bạn, sản phẩm sẽ được tạo trên Shopify Admin với 3 Variant độc lập (cố định giá thanh toán, không dùng discount ảo, checkout chuẩn 100%):

| Gói Bundle | Số lượng nhận | Giá bán thanh toán | Đơn giá / chai | Badge |
| :--- | :---: | :---: | :---: | :---: |
| **Buy 1** | 1 chai | **$34.99** | $34.99 | Single Bottle |
| **Buy 2 Get 2 FREE** | **4 chai** (Trả 2) | **$59.99** | **$15.00** | 🔥 MOST POPULAR |
| **Buy 4 Get 4 FREE** | **8 chai** (Trả 4) | **$99.98** | **$12.50** | 👑 BEST VALUE & FREE SHIPPING |

---

## 2. CẤU HÌNH UPSELL: ADD 60 FINGER WIPES

- Tạo sản phẩm vệ sinh phụ kiện đi kèm: **`Ear Finger Wipes`** (60 miếng bọc ngón lau tai).
- Thiết kế **Checkbox Upsell Widget** ngay trong Buy Box phía trên nút Add to Cart:
  - **Tiêu đề:** `Add 60 Finger Wipes`
  - **Mô tả:** `The cleaner loosens it. The wipes take it out.`
  - **Giá ưu đãi:** **+$14.99** (hoặc +$19.99) khi mua kèm Ear Cleaner.
  - Khi tick chọn, tự động add cả sản phẩm wipes vào giỏ hàng và cart drawer mượt mà.

---

## 3. CẤU HÌNH THANH TOÁN ĐỊNH KỲ 30 NGÀY (SHOPIFY SUBSCRIPTIONS)

- Tạo **SellingPlanGroup** trên Shopify backend với ID và chu kỳ:
  - **Loại:** `SUBSCRIPTION`
  - **Chu kỳ giao & trừ tiền:** Đúng **30 ngày** một lần (`interval: DAY, intervalCount: 30`).
- **Giao diện lựa chọn trên trang sản phẩm (PDP):**
  - Khách hàng có thể chuyển đổi giữa 2 chế độ:
    1. **One-time Purchase** (Mua 1 lần thông thường).
    2. **Subscribe & Auto-Delivery Every 30 Days** (Giao định kỳ mỗi 30 ngày, tự động trừ tiền qua cổng thanh toán Shopify và tự động tạo đơn hàng mới để bạn đóng gói ship).
- Khi khách chọn Subscribe, hệ thống truyền `selling_plan` ID vào cart/checkout.

---

## 4. BỐ CỤC & NỘI DUNG PDP THEO PHONG CÁCH TRYMALORA

Toàn bộ nội dung từ Amblora sẽ được tái cấu trúc theo phong cách cao cấp của Trymalora:
1. **Hero Column Left:** Gallery 7 ảnh HD gốc, zoom, thumbnail trượt.
2. **Hero Column Right:**
   - Trustpilot Verified Row: 4.9 / 5.0 (5,000+ happy pets).
   - Product Title: `Ear Cleaner for Dogs & Cats`.
   - Chế độ Mua 1 lần vs Đăng ký 30 ngày.
   - 3 Thẻ Bundle Tiers (Buy 1 / Buy 2 Get 2 Free / Buy 4 Get 4 Free).
   - Checkbox Upsell `Add 60 Finger Wipes`.
   - Nút **ADD TO CART** & **BUY NOW**.
   - Delivery Stepper 3 bước (Order Placed -> 24-48h Dispatch -> Delivered).
3. **Phần giải phẫu tai:** *"Why nothing you tried has worked"* (Ống tai chữ L của chó mèo khiến tăm bông và khăn ướt thông thường đẩy chất bẩn sâu hơn; dung dịch xả Amblora hòa tan và đẩy sạch tận gốc).
4. **Phần hiệu quả thực tế:** *"What Actually Happens After the First Rinse"* (Cún hết lắc đầu, hết gãi tai, sạch mùi hôi lập tức).
5. **Bảng so sánh Trymalora:** Dung dịch làm sạch tai vs Khăn ướt bề mặt vs Thực phẩm bổ sung.
6. **FAQ Accordion:** Hướng dẫn sử dụng, độ an toàn cho chó/mèo con, thành phần tự nhiên dịu nhẹ.

---

## 5. CÔ LẬP & AN TOÀN TUYỆT ĐỐI

- **Cô lập 100%:** Toàn bộ logic bundle, upsell và selling plan đều được đóng gói theo handle `ear-cleaner`. Không ảnh hưởng đến các sản phẩm khác (Silver Coating, Tile Paint, Rust Paste, Mini Iron...).
- **Đồng bộ theme:** Pushed trực tiếp lên cả Live Theme `#197144805747` và Draft Theme `#197111513459`.
- **Kiểm thử nghiệm thu:** Chạy kiểm thử tự động Add to Cart, Cart Drawer, Checkout cả gói Mua 1 lần và gói Subscription 30 ngày.
