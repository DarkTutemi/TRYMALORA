import fs from 'fs';
import { getAccessToken, SHOP } from './config.mjs';

const THEMES = [
  '197144805747', // Live theme
  '197111513459'  // Draft theme
];

const FILES_TO_PUSH = [
  'sections/zavelyn-v4-pdp-main.liquid',
  'assets/zavelyn-v4-pdp.css',
  'assets/zavelyn-v4-pdp.js',
  'sections/willa-cart-drawer.liquid',
  'sections/trymalora-pdp-marquee.liquid',
  'sections/trymalora-pdp-package.liquid',
  'sections/trymalora-pdp-how-it-works.liquid',
  'sections/trymalora-pdp-faq.liquid',
  'sections/trymalora-pdp-reviews.liquid'
];

async function pushAsset(themeId, key, content) {
  const token = await getAccessToken();
  const url = `https://${SHOP}/admin/api/2024-10/themes/${themeId}/assets.json`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({
      asset: {
        key: key,
        value: content
      }
    })
  });
  const data = await res.json();
  if (data.errors) {
    console.error(`Error pushing ${key} to theme ${themeId}:`, data.errors);
    return false;
  }
  console.log(`[OK] Pushed ${key} to theme ${themeId}`);
  return true;
}

async function main() {
  for (const themeId of THEMES) {
    console.log(`\n--- Pushing assets to theme ${themeId} ---`);
    for (const file of FILES_TO_PUSH) {
      const content = fs.readFileSync(file, 'utf8');
      const key = file.replace(/\\/g, '/');
      await pushAsset(themeId, key, content);
    }
  }
  console.log('\nAll assets pushed successfully!');
}

main().catch(console.error);

