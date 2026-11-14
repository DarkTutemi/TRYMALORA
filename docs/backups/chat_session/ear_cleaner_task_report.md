# Báo Cáo Hoàn Thành: Bundle Order, 100ml Variants & Subscription Discount (10% OFF)

**Sản phẩm:** [Pet Ear Cleaner for Dogs & Cats](https://trymalora.com/products/ear-cleaner)  
**Shopify Store:** `ikwh1h-fx.myshopify.com` (`trymalora.com`)  
**Product GID:** `gid://shopify/Product/15647463735667`

---

## 1. Sắp Xếp Lại Thứ Tự Bundle Chính Xác

Thứ tự bundle hiển thị từ trên xuống dưới đúng chuẩn:

1. **Bundle 1 — Buy 1**
   - Khách thanh toán 1 chai 100ml.
   - Nhận 1 chai.
   - One-time: **$34.99** / Subscribe: **$31.49**
2. **Bundle 2 — Buy 2 Get 2 FREE (`🔥 MOST POPULAR`)**
   - Khách thanh toán 2 chai 100ml.
   - Nhận tổng 4 chai (2 chai tặng miễn phí).
   - One-time: **$62.98** / Subscribe: **$56.68**
3. **Bundle 3 — Buy 4 Get 4 FREE (`👑 BEST VALUE`)**
   - Khách thanh toán 4 chai 100ml.
   - Nhận tổng 8 chai (4 chai tặng miễn phí).
   - One-time: **$111.97** / Subscribe: **$100.77** & Free Shipping

---

## 2. Đồng Bộ Dung Tích 100ml / Chai

- Cập nhật toàn bộ các biến thể variant thực tế trên Shopify Admin GraphQL:
  - Variant 1: `Buy 1 (1 × 100ml)` — SKU: `EC-100ML-1PK` — Giá: $34.99 (Compare $69.99)
  - Variant 2: `Buy 2 Get 2 FREE (4 × 100ml · Extra 10% OFF)` — SKU: `EC-100ML-4PK` — Giá: $62.98 (Compare $139.96)
  - Variant 3: `Buy 4 Get 4 FREE (8 × 100ml · Extra 20% OFF)` — SKU: `EC-100ML-8PK` — Giá: $111.97 (Compare $279.92)
- Thay thế triệt để toàn bộ chuỗi ký tự "120ml" thành "100ml" trên toàn bộ trang sản phẩm:
  - Giao diện Bundle cards
  - Accordion ("What's inside": `Includes 1× Bottle (100ml)...`)
  - Section Package Contents (`100ml sealed bottle...`)
  - Line Item Properties (`4 × 100ml Bottles`)
- **Kiểm tra DOM thực tế:** Số lượng `120ml` = 0; Số lượng `100ml` = 7.

---

## 3. Subscription Mặc Định Được Chọn (DEFAULT SELECTED)

- Tuỳ chọn **"Subscribe & Deliver Every 30 Days"** được chọn mặc định ngay khi khách mở trang (`.zv-sub-option.selected` với radio được đánh dấu).
- Kèm nhãn nổi bật: **`EXTRA 10% OFF`**.
- Khách vẫn có thể chuyển đổi mượt mà sang **"One-time purchase"** bất kỳ lúc nào.
- Gắn trực tiếp `selling_plan` ID: `693337882995` (`Delivery Every 30 Days (Extra 10% OFF)`).
- Selling Plan được cấu hình chính thức trên Shopify với chính sách chiết khấu chuẩn:
  `pricingPolicies: [{ fixed: { adjustmentType: "PERCENTAGE", adjustmentValue: { percentage: 10.0 } } }]`
  Đảm bảo mọi đơn hàng đầu tiên lẫn các kỳ gia hạn 30 ngày tự động đều tính đúng chính xác số tiền giảm 10%.

---

## 4. Bảng Giá Chi Tiết & Kết Quả Kiểm Thử (6/6 Test Cases Passed)

| Bundle | Dung Tích | One-time | Subscribe (-10%) | Giá / Chai (Sub) | Kết Quả Thực Tế |
|---|---|---:|---:|---:|:---:|
| **Buy 1** | 1 × 100ml | $34.99 | **$31.49** | $31.49 / chai | **PASS** |
| **Buy 2 Get 2 FREE** | 4 × 100ml | $62.98 | **$56.68** | $14.17 / chai | **PASS** |
| **Buy 4 Get 4 FREE** | 8 × 100ml | $111.97 | **$100.77** | $12.60 / chai | **PASS** |

### Kết quả log automation kiểm thử 6 kịch bản trên live PDP:
```text
[PASS] Case 1: Buy 1 + One-time => Got Active: $34.99, CTA: ADD TO CART · $34.99 (Expected: $34.99)
[PASS] Case 2: Buy 1 + Subscription => Got Active: $31.49, CTA: ADD TO CART · $31.49 (Expected: $31.49)
[PASS] Case 3: Buy 2 Get 2 FREE + One-time => Got Active: $62.98, CTA: ADD TO CART · $62.98 (Expected: $62.98)
[PASS] Case 4: Buy 2 Get 2 FREE + Subscription => Got Active: $56.68, CTA: ADD TO CART · $56.68 (Expected: $56.68)
[PASS] Case 5: Buy 4 Get 4 FREE + One-time => Got Active: $111.97, CTA: ADD TO CART · $111.97 (Expected: $111.97)
[PASS] Case 6: Buy 4 Get 4 FREE + Subscription => Got Active: $100.77, CTA: ADD TO CART · $100.77 (Expected: $100.77)
```

---

## 5. Xác Minh Giỏ Hàng (Cart Drawer) & Shopify Checkout

Thêm gói mặc định **Buy 2 Get 2 FREE** + **Subscription 30 ngày**:

- **Cart Items Count:** 1
- **Cart Total Price:** **$56.68**
- **Variant:** `Ear Cleaner for Dogs & Cats - Buy 2 Get 2 FREE (4 × 100ml · Extra 10% OFF)`
- **Selling Plan:** `Delivery Every 30 Days (Extra 10% OFF)` (ID: `693337882995`)
- **Properties:**
  - `_bundle`: `Buy 2 Get 2 FREE`
  - `Package`: `Buy 2 Get 2 FREE (4 × 100ml Bottles)`
  - `Bottles Delivered`: `4 × 100ml Bottles`
  - `_paid_qty`: `2`
  - `_receive_qty`: `4`
  - `Gift`: `2 FREE 100ml Bottles`
  - `Subscription`: `Auto-Renews Every 30 Days (Extra 10% OFF)`
- **Addon Upsell "Add 60 Finger Wipes" (+$14.99):** Giữ nguyên hoạt động trơn tru. Khi tích chọn, tổng đơn tự cộng thêm $14.99 ($71.67 cho Subscription, $77.97 cho One-time).

---

## 6. Danh Sách File Đã Chỉnh Sửa & Triển Khai

1. `sections/zavelyn-v4-pdp-main.liquid`:
   - Sắp xếp lại thứ tự 3 thẻ Bundle (Buy 1, Buy 2 Get 2 FREE, Buy 4 Get 4 FREE).
   - Đổi Subscription 30 ngày thành mặc định được chọn (`selected`) với badge `EXTRA 10% OFF`.
   - Cập nhật dung tích từ 120ml sang 100ml ở Bundle cards và Accordion.
2. `assets/zavelyn-v4-pdp.js`:
   - Thêm controller tính giá động theo thời gian thực khi chuyển đổi qua lại giữa One-time và Subscription.
   - Cập nhật nhãn giá hiển thị trên từng thẻ bundle, hero price, savings pill và nút CTA.
   - Đính kèm đúng `selling_plan: 693337882995` khi chọn subscription.
3. `sections/trymalora-pdp-package.liquid`:
   - Đồng bộ mô tả chai 100ml trong Package contents.
4. `sections/willa-cart-drawer.liquid`:
   - Cập nhật nhãn hiển thị 100ml trong cart drawer và bảo vệ logic tính giá native cho line items subscription.
5. **Đồng bộ Live Theme & Draft Theme:** Đã đẩy code hoàn tất lên cả Live Theme (`197144805747`) và Draft Theme (`197111513459`).
6. **Kiểm tra hồi quy (Regression Test):** Tất cả các sản phẩm khác trên store (`metallic-silver`, `tile-refinishing`, `car-rust`) đều hoạt động ổn định và không bị ảnh hưởng.
