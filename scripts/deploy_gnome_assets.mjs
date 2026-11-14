import { getAccessToken, SHOP, API_VERSION, THEME_ID } from './config.mjs';
import fs from 'fs';

const targetThemeId = THEME_ID;

const filesToUpload = [
  'sections/zavelyn-v4-pdp-main.liquid',
  'sections/clg-gnome-editorial.liquid',
  'sections/trymalora-pdp-package.liquid',
  'sections/trymalora-pdp-how-it-works.liquid',
  'sections/trymalora-pdp-faq.liquid',
  'sections/trymalora-pdp-reviews.liquid',
  'sections/trymalora-pdp-marquee.liquid',
  'templates/product.christmas-lantern-welcome-gnome.json'
];

async function deployGnomeAssets() {
  console.log(`======================================================`);
  console.log(`DEPLOYING GNOME ASSETS TO THEME: ${targetThemeId}`);
  console.log(`Store: ${SHOP}`);
  console.log(`======================================================\n`);

  const token = await getAccessToken(true);

  for (const filePath of filesToUpload) {
    const key = filePath.replace(/\\/g, '/');
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      continue;
    }
    const content = fs.readFileSync(filePath, 'utf8');

    const url = `https://${SHOP}/admin/api/${API_VERSION}/themes/${targetThemeId}/assets.json`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        asset: {
          key,
          value: content
        }
      })
    });

    const data = await res.json();
    if (data.asset) {
      console.log(`✔ [OK] Uploaded ${key} (${content.length} bytes)`);
    } else {
      console.error(`❌ [FAIL] Uploading ${key}:`, JSON.stringify(data));
    }
  }

  console.log('\n======================================================');
  console.log('🎉 ALL GNOME ASSETS DEPLOYED TO THEME SUCCESSFULLY!');
  console.log('======================================================');
}

deployGnomeAssets().catch(console.error);

