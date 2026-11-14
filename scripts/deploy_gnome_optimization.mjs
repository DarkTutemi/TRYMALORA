import { getAccessToken, SHOP, API_VERSION, THEME_ID } from './config.mjs';
import fs from 'fs';

async function main() {
  if (String(THEME_ID) !== '197144805747') {
    throw new Error(`Safety abort: Unexpected THEME_ID ${THEME_ID}, expected draft 197144805747`);
  }

  const templateKey = 'templates/product.christmas-lantern-welcome-gnome.json';
  JSON.parse(fs.readFileSync(templateKey, 'utf8'));
  console.log('✔ JSON template valid:', templateKey);

  const liquidSections = [
    'sections/zavelyn-v4-pdp-main.liquid',
    'sections/trymalora-pdp-package.liquid',
    'sections/trymalora-pdp-how-it-works.liquid',
    'sections/trymalora-pdp-faq.liquid',
    'sections/trymalora-pdp-reviews.liquid'
  ];

  for (const f of liquidSections) {
    const txt = fs.readFileSync(f, 'utf8');
    const m = txt.match(/\{% schema %\}([\s\S]*?)\{% endschema %\}/);
    if (!m) throw new Error(`Missing schema in ${f}`);
    JSON.parse(m[1]);
    console.log('✔ Schema JSON valid:', f);
  }

  const filesToUpload = [
    'assets/zavelyn-v4-pdp.css',
    'assets/zavelyn-v4-pdp.js',
    ...liquidSections,
    templateKey
  ];

  const token = await getAccessToken(true);
  for (const f of filesToUpload) {
    const content = fs.readFileSync(f, 'utf8');
    const url = `https://${SHOP}/admin/api/${API_VERSION}/themes/${THEME_ID}/assets.json`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        asset: { key: f, value: content }
      })
    });
    const d = await res.json();
    if (d.asset) {
      console.log(`✔ Uploaded to draft ${THEME_ID}: ${f}`);
    } else {
      console.error(`✖ Upload failed for ${f}:`, d);
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
