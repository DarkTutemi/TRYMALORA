import { adminGraphql, getAccessToken, SHOP, API_VERSION, THEME_ID } from './config.mjs';
import fs from 'fs';
import path from 'path';

async function main() {
  // 1. Query hosted product media
  const res = await adminGraphql(`
    query {
      productByHandle(handle: "christmas-lantern-welcome-gnome") {
        id
        title
        descriptionHtml
        media(first: 15) {
          edges {
            node {
              ... on MediaImage {
                id
                image { url width height altText }
              }
            }
          }
        }
        variants(first: 10) {
          edges {
            node { id title price compareAtPrice inventoryQuantity availableForSale }
          }
        }
      }
    }
  `);
  console.log('=== SHOPIFY PRODUCT DATA ===');
  console.log(JSON.stringify(res.productByHandle, null, 2));

  // 2. Check hotlinks in PDP sections
  for (const f of ['sections/trymalora-pdp-package.liquid', 'sections/trymalora-pdp-how-it-works.liquid', 'sections/trymalora-pdp-faq.liquid', 'sections/trymalora-pdp-reviews.liquid']) {
    const txt = fs.readFileSync(f, 'utf8');
    const urls = [...new Set((txt.match(/https:\/\/[^\s"'<>]+/g) || []).filter(u => u.includes('ncrovoprime') || u.includes('0826/2483/9865')))];
    console.log('=== HOTLINKS in', f, '===');
    urls.forEach(u => console.log(' ', u));
  }

  // 3. Create recoverable backup from live draft theme 197144805747 before editing
  const backupDir = 'data/backup_theme_197144805747_' + new Date().toISOString().slice(0,10);
  fs.mkdirSync(backupDir, { recursive: true });
  const keys = [
    'templates/product.christmas-lantern-welcome-gnome.json',
    'sections/zavelyn-v4-pdp-main.liquid',
    'sections/trymalora-pdp-package.liquid',
    'sections/trymalora-pdp-how-it-works.liquid',
    'sections/trymalora-pdp-faq.liquid',
    'sections/trymalora-pdp-reviews.liquid',
    'assets/zavelyn-v4-pdp.css',
    'assets/zavelyn-v4-pdp.js'
  ];
  const token = await getAccessToken(true);
  for (const k of keys) {
    const u = `https://${SHOP}/admin/api/${API_VERSION}/themes/${THEME_ID}/assets.json?asset[key]=${encodeURIComponent(k)}`;
    const r = await fetch(u, { headers: { 'X-Shopify-Access-Token': token } });
    const d = await r.json();
    if (d.asset && d.asset.value) {
      const out = path.join(backupDir, k.replace(/\//g, '__'));
      fs.writeFileSync(out, d.asset.value, 'utf8');
      console.log('✔ Backed up:', k, '->', out);
    }
  }
}

main().catch(console.error);

