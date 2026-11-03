import { getAccessToken, SHOP, API_VERSION, THEME_ID } from './config.mjs';
import fs from 'fs';
import path from 'path';

const targetThemeId = process.argv[2] || THEME_ID;

if (!targetThemeId) {
  console.error('Error: No target THEME_ID specified. Set SHOPIFY_THEME_ID in .env or pass as argument: node scripts/deploy_theme.mjs <THEME_ID>');
  process.exit(1);
}

async function uploadAsset(key, contentOrBuffer, token, isBase64 = false) {
  const url = `https://${SHOP}/admin/api/${API_VERSION}/themes/${targetThemeId}/assets.json`;
  const body = isBase64
    ? { asset: { key, attachment: contentOrBuffer } }
    : { asset: { key, value: contentOrBuffer } };

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (data.asset) {
    console.log(`  [OK] Uploaded ${key}`);
    return true;
  } else {
    console.error(`  [FAIL] Failed to upload ${key}:`, JSON.stringify(data));
    return false;
  }
}

async function main() {
  console.log(`======================================================`);
  console.log(`TRYMALORA THEME DEPLOYMENT`);
  console.log(`Store:  ${SHOP}`);
  console.log(`Target: THEME ${targetThemeId}`);
  console.log(`======================================================\n`);

  const token = await getAccessToken();

  // Deploy order: assets -> snippets -> sections -> layout -> config -> locales -> templates
  const dirs = ['assets', 'snippets', 'sections', 'layout', 'config', 'locales', 'templates'];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    console.log(`\n--- Uploading ${dir} ---`);
    const files = fs.readdirSync(dir, { recursive: true });

    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) continue;

      const normalizedKey = fullPath.replace(/\\/g, '/');
      const isBinary = /\.(png|jpg|jpeg|gif|webp|ico|woff2|woff|ttf|eot)$/i.test(file);

      try {
        if (isBinary) {
          const b64 = fs.readFileSync(fullPath).toString('base64');
          await uploadAsset(normalizedKey, b64, token, true);
        } else {
          const content = fs.readFileSync(fullPath, 'utf8');
          await uploadAsset(normalizedKey, content, token, false);
        }
      } catch (err) {
        console.error(`  [ERR] Error processing ${normalizedKey}:`, err.message);
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`DEPLOYMENT FINISHED!`);
  console.log(`Preview: https://${SHOP}/?preview_theme_id=${targetThemeId}`);
  console.log(`======================================================`);
}

main().catch(console.error);
