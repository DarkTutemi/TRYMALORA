import { getAccessToken, SHOP, API_VERSION } from './config.mjs';
import fs from 'fs';

const TARGET_THEME_ID = '197625381235';

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

async function deployCol() {
  const f1 = 'sections/malora-collection-main.liquid';
  console.log(`Uploading ${f1}...`);
  await putAsset(TARGET_THEME_ID, f1, fs.readFileSync(f1, 'utf8'));
  console.log(`  -> ✔ ${f1} uploaded successfully!`);

  const f2 = 'templates/collection.json';
  console.log(`Uploading ${f2}...`);
  await putAsset(TARGET_THEME_ID, f2, fs.readFileSync(f2, 'utf8'));
  console.log(`  -> ✔ ${f2} uploaded successfully!`);
}

deployCol().catch(console.error);
