import { getAccessToken, SHOP, API_VERSION, THEME_ID } from './config.mjs';
import fs from 'fs';

async function deployUpsellFiles() {
  const files = [
    'sections/zavelyn-v4-pdp-main.liquid',
    'assets/zavelyn-v4-pdp.css',
    'assets/zavelyn-v4-pdp.js'
  ];

  const token = await getAccessToken(true);

  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const url = `https://${SHOP}/admin/api/${API_VERSION}/themes/${THEME_ID}/assets.json`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        asset: {
          key: f,
          value: content
        }
      })
    });
    const d = await res.json();
    if (d.asset) {
      console.log(`✔ [OK] Uploaded ${f}`);
    } else {
      console.error(`❌ [FAIL] ${f}:`, d);
    }
  }
}

deployUpsellFiles().catch(console.error);

