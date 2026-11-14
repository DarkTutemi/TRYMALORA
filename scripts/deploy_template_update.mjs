import { getAccessToken, SHOP, API_VERSION, THEME_ID } from './config.mjs';
import fs from 'fs';

async function updateTheme() {
  console.log(`Updating theme ${THEME_ID} on ${SHOP}...`);
  const token = await getAccessToken(true);

  // 1. Upload updated template
  const templatePath = 'templates/product.christmas-lantern-welcome-gnome.json';
  const templateContent = fs.readFileSync(templatePath, 'utf8');

  const putUrl = `https://${SHOP}/admin/api/${API_VERSION}/themes/${THEME_ID}/assets.json`;
  const res = await fetch(putUrl, {
    method: 'PUT',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      asset: {
        key: templatePath,
        value: templateContent
      }
    })
  });

  const data = await res.json();
  if (data.asset) {
    console.log(`✔ [OK] Successfully uploaded ${templatePath}`);
  } else {
    console.error(`❌ [FAIL] Failed to upload ${templatePath}:`, data);
  }

  // 2. Delete sections/clg-gnome-editorial.liquid from theme assets
  const deleteKey = 'sections/clg-gnome-editorial.liquid';
  const delUrl = `https://${SHOP}/admin/api/${API_VERSION}/themes/${THEME_ID}/assets.json?asset[key]=${encodeURIComponent(deleteKey)}`;
  const delRes = await fetch(delUrl, {
    method: 'DELETE',
    headers: {
      'X-Shopify-Access-Token': token
    }
  });
  const delData = await delRes.json();
  console.log(`✔ Deleted unused asset ${deleteKey} from theme:`, delData);
}

updateTheme().catch(console.error);

