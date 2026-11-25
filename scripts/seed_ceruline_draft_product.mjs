import fs from 'fs';
import { getAccessToken, SHOP } from './config.mjs';

async function seedCerulineDraftProduct() {
  const token = await getAccessToken();
  const src = JSON.parse(fs.readFileSync('scripts/ceruline_audit/product.json', 'utf8')).product;

  // Check if already exists
  const checkRes = await fetch(`https://${SHOP}/admin/api/2024-01/products.json?handle=ceruline-us-afm-dfm-disabler`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const checkData = await checkRes.json();
  if (checkData.products && checkData.products.length > 0) {
    console.log('Draft product already exists:', checkData.products[0].id);
    return;
  }

  const payload = {
    product: {
      title: src.title,
      handle: 'ceruline-us-afm-dfm-disabler',
      body_html: src.body_html || '<p>CERULINE AFM/DFM Disabler — Plug-and-Play Active Fuel Management Disabler.</p>',
      vendor: 'CERULINE',
      product_type: 'Automotive Electronics',
      status: 'draft',
      template_suffix: 'ceruline-us',
      options: src.options.map(o => ({ name: o.name, values: o.values })),
      variants: src.variants.map(v => ({
        option1: v.option1,
        option2: v.option2,
        option3: v.option3,
        price: v.price,
        compare_at_price: v.compare_at_price,
        sku: v.sku || `CERULINE-US-${v.id}`
      })),
      images: src.images.map(img => ({ src: img.src, alt: img.alt || src.title }))
    }
  };

  const res = await fetch(`https://${SHOP}/admin/api/2024-01/products.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data.product) {
    console.log('CREATED DRAFT PRODUCT:', data.product.id, 'Handle:', data.product.handle, 'Variants:', data.product.variants.length, 'Images:', data.product.images.length);
  } else {
    console.error('Failed:', JSON.stringify(data));
  }
}

seedCerulineDraftProduct().catch(console.error);
