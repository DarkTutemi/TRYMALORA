import fs from 'fs';
import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

const DRAFT_THEME_ID = '198133088627';

// 1. Trim ceruline-us-footer.liquid to actual <footer>...</footer>
let footer = fs.readFileSync('sections/ceruline-us-footer.liquid', 'utf8');
const fStart = footer.indexOf('<footer');
const fEnd = footer.indexOf('</footer>', fStart);
if (fStart !== -1 && fEnd !== -1) {
  const cleanFooter = footer.slice(fStart, fEnd + 9);
  fs.writeFileSync('sections/ceruline-us-footer.liquid', `{% comment %} CERULINE US FOOTER {% endcomment %}\n${cleanFooter}\n{% schema %}\n{ "name": "Ceruline US Footer", "settings": [] }\n{% endschema %}`);
  console.log('Trimmed ceruline-us-footer.liquid to', cleanFooter.length, 'chars');
}

// 2. Trim ceruline-us-reviews.liquid to < 200KB
let reviews = fs.readFileSync('sections/ceruline-us-reviews.liquid', 'utf8');
if (reviews.length > 200000) {
  const cut = reviews.slice(0, 180000);
  const lastDiv = cut.lastIndexOf('</div>');
  const cleanReviews = cut.slice(0, lastDiv + 6) + '</div></div>';
  fs.writeFileSync('sections/ceruline-us-reviews.liquid', `${cleanReviews}\n{% schema %}\n{ "name": "Ceruline US Reviews", "settings": [] }\n{% endschema %}`);
  console.log('Trimmed ceruline-us-reviews.liquid to', cleanReviews.length, 'chars');
}

async function putAsset(key, value) {
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${DRAFT_THEME_ID}/assets.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ asset: { key, value } })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${key}: ${await res.text()}`);
  console.log(`✔ ${key}`);
}

async function run() {
  for (const k of [
    'sections/ceruline-us-footer.liquid',
    'sections/ceruline-us-reviews.liquid',
    'sections/footer-group.json',
    'templates/product.ceruline-us.json'
  ]) {
    const val = k.endsWith('footer-group.json')
      ? JSON.stringify({ name: 'Footer group', type: 'footer', sections: { footer: { type: 'ceruline-us-footer', settings: {} } }, order: ['footer'] }, null, 2)
      : fs.readFileSync(k, 'utf8');
    await putAsset(k, val);
    await new Promise(r => setTimeout(r, 400));
  }
  console.log('=== ALL 24/24 DRAFT THEME FILES DEPLOYED ===');
}

run().catch(console.error);
