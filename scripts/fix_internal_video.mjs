import fs from 'fs';
import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

let html = fs.readFileSync('sections/ceruline-us-benefits-1.liquid', 'utf8');

// Replace <internal-video ...>...</internal-video> with clean native <video>
const cleanVideo = `<video id="CerulineBenefitsVideo" autoplay loop muted playsinline controls style="width:100%;height:auto;display:block;border-radius:12px;position:relative;z-index:5;">
  <source src="{{ 'ceruline-us-benefits-1.mp4' | asset_url }}" type="video/mp4">
</video>`;

html = html.replace(/<internal-video[\s\S]*?<\/internal-video>/i, cleanVideo);
fs.writeFileSync('sections/ceruline-us-benefits-1.liquid', html);

const token = await getAccessToken();
const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235/assets.json`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
  body: JSON.stringify({ asset: { key: 'sections/ceruline-us-benefits-1.liquid', value: html } })
});
console.log('Uploaded ceruline-us-benefits-1.liquid ->', res.status);
