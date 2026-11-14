# Báo Cáo Hoàn Tất Clone Sản Phẩm Ear Cleaner & Tích Hợp Recurring 30 Ngày

## 1. Tổng Quan & Cấu Hình Sản Phẩm

- **URL Sản Phẩm Live:** [https://trymalora.com/products/ear-cleaner](https://trymalora.com/products/ear-cleaner)
- **ID Sản Phẩm Shopify:** `gid://shopify/Product/15647463735667`
- **Hình Ảnh PDP:** Đã import đầy đủ 7 ảnh độ phân giải cao gốc từ Amblora.
- **Sản Phẩm Companion Upsell:** `Pet Ear Finger Wipes (60 Wipes)` (`gid://shopify/Product/15647466160499`), giá **$14.99** (giá gốc $24.99).

---

## 2. Cấu Hình 3 Tầng Bundle (Đúng Công Thức Yêu Cầu)

| Tầng Bundle | Số Chai Nhận | Đơn Giá / Chai | Tổng Giá Bán | So Sánh (Compare At) | Ưu Đãi & Huy Hiệu |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Buy 1** | 1 chai | $34.99 | **$34.99** | $69.99 | Chai lẻ dùng thử tiêu chuẩn |
| **Buy 2 Get 2 FREE** *(Mặc định chọn)* | 4 chai | $15.74 | **$62.98** | $139.96 | 🔥 **MOST POPULAR** · Pay for 2, Get 2 Free · **Extra 10% OFF** |
| **Buy 4 Get 4 FREE** | 8 chai | $13.99 | **$111.97** | $279.92 | 👑 **BEST VALUE** · Pay for 4, Get 4 Free · **Extra 20% OFF** · **FREE Shipping** |

---

## 3. Upsell: Add 60 Finger Wipes

- **Checkbox:** `Add 60 Finger Wipes` (+ **$14.99** · ~~`$24.99`~~).
- **Subtitle:** *"The cleaner loosens it. The wipes take it out. Pre-moistened textured wipes for effortless gunk removal."*
- **Tương tác động:**
  - Khi tick chọn: Tự động cộng +$14.99 vào tổng giá và nút CTA.
  - Khi chọn gói Buy 2 ($62.98) + Wipes ($14.99) = **$77.97** $\ge$ $70 $\rightarrow$ Tự động mở khóa **FREE Tracked US Shipping** ngay tức thì.
  - Khi add to cart: Tự động add đồng thời cả chai Ear Cleaner lẫn hộp 60 Wipes vào giỏ hàng.

---

## 4. Thanh Toán Định Kỳ 30 Ngày (Shopify Subscriptions)

- **SellingPlanGroup ID:** `gid://shopify/SellingPlanGroup/79959458163`
- **SellingPlan ID:** `gid://shopify/SellingPlan/693337882995` (`Delivery Every 30 Days`)
- **Cơ chế hoạt động:**
  - Khách hàng có 2 tùy chọn dạng radio:
    1. `One-time purchase`: Mua 1 lần bình thường.
    2. `Subscribe & Deliver Every 30 Days`: Tự động trừ tiền và tạo đơn giao hàng mỗi 30 ngày. Khách có thể pause, skip, hoặc cancel bất cứ lúc nào trong 1 click.
  - Hệ thống tích hợp trực tiếp qua Shopify Native Subscriptions Engine và Checkout PCI-DSS an toàn tuyệt đối.

---

## 5. Kết Quả Kiểm Thử Thực Tế (QA Verification)

1. **PDP Desktop & Mobile:** Render chuẩn phong cách luxury của Trymalora (bộ font Fraunces & Inter, badge `TOP RATED · PET HEALTH & CARE`, Trustpilot 4.9/5.0 với 5,420 đánh giá).
2. **Kiểm thử Checkout Gói Thường + Upsell:**
   - 1× Buy 2 Get 2 FREE: $62.98
   - 1× Add 60 Finger Wipes: $14.99
   - **Tổng thanh toán:** **$77.97** (Đã mở khóa Free Shipping).
3. **Kiểm thử Checkout Subscription:**
   - Đã gán `selling_plan: 693337882995` vào checkout, hiển thị chu kỳ lặp lại 30 ngày.
4. **Kiểm thử Regression (Không ảnh hưởng các sản phẩm khác):**
   - `Metallic Silver Coating`: Vẫn giữ nguyên $99.95 (Buy 5 Get 3 Free, Buy 3 Get 1 Free, 1 Can 50g). Không bị nhiễm subscription hay upsell.
   - `Tile Refinishing Kit` & `Car Metal Rust Paste`: Hoạt động 100% bình thường.
