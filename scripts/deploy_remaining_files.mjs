import { getAccessToken, SHOP, API_VERSION } from './config.mjs';
import fs from 'fs';

const TARGET_THEME_ID = '197625381235';

const remainingFiles = [
  'sections/malora-featured-collection.liquid',
  'sections/malora-footer.liquid',
  'sections/header-group.json',
  'sections/footer-group.json',
  'templates/index.json',
  'templates/product.json'
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

async function deployRemaining() {
  console.log('=== UPLOADING REMAINING 6 FILES ===');
  for (const file of remainingFiles) {
    const content = fs.readFileSync(file, 'utf8');
    console.log(`Uploading ${file}...`);
    try {
      await putAsset(TARGET_THEME_ID, file, content);
      console.log(`  -> ✔ ${file} SUCCESS!`);
    } catch (e) {
      console.error(`  -> ❌ ERROR ${file}:`, e.message);
    }
    await new Promise(r => setTimeout(r, 600));
  }
}

deployRemaining().catch(console.error);
