import { getAccessToken, SHOP, API_VERSION } from './config.mjs';
import fs from 'fs';
import path from 'path';

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

async function reupload() {
  const files = fs.readdirSync('sections').filter(f => f.startsWith('malora-') && f.endsWith('.liquid'));
  console.log(`Re-uploading ${files.length} malora sections with restored image URLs...`);

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const assetKey = `sections/${f}`;
    const content = fs.readFileSync(path.join('sections', f), 'utf8');

    console.log(`[${i + 1}/${files.length}] Uploading ${assetKey}...`);
    try {
      await putAsset(TARGET_THEME_ID, assetKey, content);
      console.log(`  -> ✔ Success!`);
    } catch (e) {
      console.error(`  -> ❌ Error:`, e.message);
    }
    await new Promise(r => setTimeout(r, 400));
  }
  console.log('=== ALL SECTIONS RE-UPLOADED SUCCESSFULLY! ===');
}

reupload().catch(console.error);
