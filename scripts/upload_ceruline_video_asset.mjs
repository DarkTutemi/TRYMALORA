import fs from 'fs';
import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

const VIDEO_URL = 'https://ceruline.com/cdn/shop/videos/c/vp/31aa2b68ee764db2bfe73cbb037634d7/31aa2b68ee764db2bfe73cbb037634d7.SD-480p-1.2Mbps-85615069.mp4?v=0';

async function run() {
  console.log('Downloading MP4...');
  const vRes = await fetch(VIDEO_URL);
  const buf = Buffer.from(await vRes.arrayBuffer());
  console.log('Downloaded MP4:', buf.length, 'bytes');
  fs.writeFileSync('assets/ceruline-us-benefits-1.mp4', buf);

  const token = await getAccessToken();
  // Upload binary asset to Live Theme 197625381235
  const upAsset = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235/assets.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      asset: {
        key: 'assets/ceruline-us-benefits-1.mp4',
        attachment: buf.toString('base64')
      }
    })
  });
  console.log('Uploaded assets/ceruline-us-benefits-1.mp4 ->', upAsset.status);

  // Update ceruline-us-benefits-1.liquid to use local asset_url and balanced layout
  let html = fs.readFileSync('sections/ceruline-us-benefits-1.liquid', 'utf8');
  html = html.replace(/https:\/\/ceruline\.com\/cdn\/shop\/videos\/[^"']+/g, "{{ 'ceruline-us-benefits-1.mp4' | asset_url }}");
  fs.writeFileSync('sections/ceruline-us-benefits-1.liquid', html);

  const upSec = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235/assets.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      asset: {
        key: 'sections/ceruline-us-benefits-1.liquid',
        value: html
      }
    })
  });
  console.log('Uploaded sections/ceruline-us-benefits-1.liquid ->', upSec.status);
}

run().catch(console.error);
