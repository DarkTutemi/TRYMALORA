# Trymalora Shopify Theme (Online Store 2.0)
> **Immersive Retail Showroom V4 + High-Converting Modular PDP Architecture**

---

## 1. Cấu Trúc Dự Án (Chuẩn Shopify Theme 2.0)

Thư mục dự án đã được thiết lập theo đúng chuẩn Shopify Theme để chạy trực tiếp với **Shopify CLI**:

```
TRYMALORA/
├── assets/          # CSS tokens, showroom JS/CSS, PDP styles, icons, cutout images
├── config/          # settings_data.json, settings_schema.json
├── layout/          # theme.liquid (đã tích hợp tokens & layout Trymalora), password.liquid
├── locales/         # en.default.json
├── sections/        # V4 Showroom, V4 Stores, V4 Hero, V4 PDP Main, Header, Footer...
├── snippets/        # V4 Quickview, Card Product, Bundles, Upsells...
├── templates/       # index.json (Showroom V4), product.json, collection.json...
│   └── customers/   # Account templates
├── scripts/         # Script tự động hóa API (deploy, create draft, list themes)
│   ├── config.mjs
│   ├── deploy_theme.mjs
│   ├── create_draft_theme.mjs
│   └── query_themes.mjs
├── .agents/         # Antigravity Skills (Shopify CLI guides & Liquid references)
├── .env.example     # File mẫu cấu hình store mới Trymalora
└── package.json     # Shortcuts chạy CLI
```

---

## 2. Các Cách Làm Việc Với CLI

### Cách 1: Sử dụng Shopify CLI chính thức (Khuyên Dùng khi Live Dev)

1. **Khởi động Dev Server xem trước trực tiếp (Live Reload):**
   ```bash
   shopify theme dev --store <ten-store-trymalora>.myshopify.com
   ```
   *(Shopify sẽ mở link preview `127.0.0.1:9292` đồng bộ trực tiếp khi bạn sửa code Liquid/CSS).*

2. **Đẩy (Push) theme lên store Trymalora:**
   ```bash
   # Push lên theme chưa publish (tạo theme mới hoặc chọn theme có sẵn)
   shopify theme push --store <ten-store-trymalora>.myshopify.com --unpublished
   ```

3. **Kiểm tra cú pháp code theme (Linter):**
   ```bash
   shopify theme check
   ```

---

### Cách 2: Sử dụng NodeJS Scripts (Nhanh & Tự Động Hóa qua API)

1. Sao chép `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```
2. Điền thông tin store `Trymalora` vào `.env`:
   - `SHOPIFY_STORE=<ten-store-trymalora>.myshopify.com`
   - `SHOPIFY_CLIENT_ID=...`
   - `SHOPIFY_CLIENT_SECRET=...`
   - `SHOPIFY_THEME_ID=...`

3. Chạy các lệnh:
   - **Xem danh sách themes trên store:**
     ```bash
     npm run theme:list
     ```
   - **Tạo một theme draft mới trên store:**
     ```bash
     npm run theme:create-draft
     ```
   - **Deploy toàn bộ code theme lên theme chỉ định:**
     ```bash
     npm run theme:deploy
     ```

---

## 3. Các Điểm Cần Chú Ý Khi Thiết Lập Store Trymalora

1. **Sản phẩm & Bộ sưu tập (Catalog):**
   - Theme Showroom V4 được thiết kế theo cấu trúc linh hoạt. Sau khi đẩy theme lên store mới, vào **Online Store > Themes > Customize** để gán lại các collection/sản phẩm thực tế của Trymalora.
2. **Ảnh Cutout / Tách nền:**
   - Trong `assets/` đã có sẵn các file cutout và token mẫu. Bạn có thể thay thế hoặc upload ảnh tách nền (PNG) của sản phẩm mới qua block **`Catalog & Showroom Image`** trong Theme Editor.
3. **Metafield (nếu dùng):**
   - Nếu muốn gán ảnh tách nền qua metafield sản phẩm, hãy tạo definition trong **Shopify Admin > Settings > Custom data > Products**:
     - `custom.catalog_image` (File / Image)
     - `custom.showroom_cutout` (File / Image)
