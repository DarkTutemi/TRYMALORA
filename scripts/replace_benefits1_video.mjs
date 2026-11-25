import fs from 'fs';
import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

let html = fs.readFileSync('sections/ceruline-us-benefits-1.liquid', 'utf8');
const videoTag = '<video autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit;"><source src="https://ceruline.com/cdn/shop/videos/c/vp/31aa2b68ee764db2bfe73cbb037634d7/31aa2b68ee764db2bfe73cbb037634d7.SD-480p-1.2Mbps-85615069.mp4?v=0" type="video/mp4"></video>';
html = html.replace(/<img[^>]*>/i, videoTag);
fs.writeFileSync('sections/ceruline-us-benefits-1.liquid', html);

const token = await getAccessToken();
const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235/assets.json`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
  body: JSON.stringify({ asset: { key: 'sections/ceruline-us-benefits-1.liquid', value: html } })
});
console.log('ceruline-us-benefits-1.liquid ->', res.status);
