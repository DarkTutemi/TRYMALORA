import fs from 'fs';
import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

const LIVE_THEME_ID = '197625381235';
const PRODUCT_ID = '15706499285363';

async function putAsset(key, value) {
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${LIVE_THEME_ID}/assets.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ asset: { key, value } })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${key}: ${await res.text()}`);
  console.log(`✔ ${key}`);
}

async function run() {
  const token = await getAccessToken();

  // 1. Upload ceruline-us assets
  for (const f of fs.readdirSync('assets').filter(f => f.startsWith('ceruline-us-'))) {
    await putAsset(`assets/${f}`, fs.readFileSync(`assets/${f}`, 'utf8'));
    await new Promise(r => setTimeout(r, 250));
  }

  // 2. Upload ceruline-us sections
  for (const f of fs.readdirSync('sections').filter(f => f.startsWith('ceruline-us-'))) {
    await putAsset(`sections/${f}`, fs.readFileSync(`sections/${f}`, 'utf8'));
    await new Promise(r => setTimeout(r, 250));
  }

  // 3. Upload template & layout
  await putAsset('templates/product.ceruline-us.json', fs.readFileSync('templates/product.ceruline-us.json', 'utf8'));
  await putAsset('layout/theme.liquid', fs.readFileSync('layout/theme.liquid', 'utf8'));

  // 4. Activate product 15706499285363 for ads
  const pRes = await fetch(`https://${SHOP}/admin/api/2024-01/products/${PRODUCT_ID}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ product: { id: Number(PRODUCT_ID), status: 'active', published: true } })
  });
  console.log('Activated product status:', pRes.status);
}

run().catch(console.error);
