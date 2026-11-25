import { getAccessToken, SHOP, API_VERSION } from './config.mjs';
import fs from 'fs';
import crypto from 'crypto';

const TARGET_THEME_ID = '197625381235';

function sha256(str) {
  const normalized = str.replace(/\r\n/g, '\n').trim();
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

const templatesToDeploy = [
  'sections/header-group.json',
  'sections/footer-group.json',
  'templates/index.json',
  'templates/product.json',
  'layout/theme.liquid'
];

async function putAsset(themeId, assetKey, content) {
  const token = await getAccessToken();
  const url = `https://${SHOP}/admin/api/${API_VERSION}/themes/${themeId}/assets.json`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ asset: { key: assetKey, value: content } })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to upload ${assetKey} (HTTP ${res.status}): ${txt}`);
  }
  return await res.json();
}

async function run() {
  console.log('=== UPLOADING JSON TEMPLATES & HEADER/FOOTER GROUPS ===');
  for (const file of templatesToDeploy) {
    const content = fs.readFileSync(file, 'utf8');
    console.log(`Uploading ${file}...`);
    try {
      await putAsset(TARGET_THEME_ID, file, content);
      console.log(`  -> ✔ ${file} UPLOADED SUCCESSFULLY!`);
    } catch (e) {
      console.error(`  -> ❌ ERROR ${file}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 500));
  }
}

run().catch(console.error);
