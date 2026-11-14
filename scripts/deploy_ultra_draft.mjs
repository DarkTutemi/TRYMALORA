import { getAccessToken, SHOP, API_VERSION } from './config.mjs';
import fs from 'fs';
import path from 'path';

// Target MUST be the Draft Theme ID
const DRAFT_THEME_ID = '197625381235';
const LIVE_THEME_ID = '197144805747';

if (DRAFT_THEME_ID === LIVE_THEME_ID) {
  console.error('CRITICAL ERROR: Cannot deploy to Live theme!');
  process.exit(1);
}

const filesToUpload = [
  // Assets
  'assets/ultra-logo.svg',
  'assets/ultra-logo-white.svg',
  'assets/ultra-overnight.css',
  'assets/ultra-overnight.js',
  'assets/ultra-hero-lifestyle.jpg',
  'assets/ultra-5-layers-cutaway.png',
  'assets/ultra-5-layers-exploded.png',
  'assets/ultra-lifestyle-card-1.jpg',
  'assets/ultra-lifestyle-card-2.jpg',
  'assets/ultra-lifestyle-card-3.jpg',
  'assets/ultra-avatar-emily.jpg',
  'assets/ultra-avatar-nicole.jpg',
  'assets/ultra-avatar-jasmine.jpg',
  'assets/ultra-pdp-main.jpg',
  'assets/ultra-thumb-front.jpg',
  'assets/ultra-thumb-box.jpg',
  'assets/ultra-thumb-texture.jpg',
  'assets/ultra-thumb-lifestyle.jpg',

  // Sections
  'sections/ultra-header.liquid',
  'sections/ultra-hero.liquid',
  'sections/ultra-benefit-strip.liquid',
  'sections/ultra-seven-pillars.liquid',
  'sections/ultra-five-layers.liquid',
  'sections/ultra-lifestyle-comfort.liquid',
  'sections/ultra-reviews.liquid',
  'sections/ultra-faq.liquid',
  'sections/ultra-footer.liquid',
  'sections/ultra-product-main.liquid',
  'sections/ultra-pdp-tabs.liquid',
  'sections/ultra-about-story.liquid',
  'sections/ultra-track-order.liquid',
  'sections/ultra-contact.liquid',
  'sections/header-group.json',
  'sections/footer-group.json',
  'sections/willa-header.liquid',
  'sections/willa-footer.liquid',
  'sections/willa-cart-drawer.liquid',

  // Templates
  'templates/index.json',
  'templates/product.ultra-overnight.json',
  'templates/page.about-us.json',
  'templates/page.track-order.json',
  'templates/page.faq.json',
  'templates/page.contact.json',

  // Layout
  'layout/theme.liquid'
];

async function uploadAsset(key, contentOrBuffer, token, isBase64 = false) {
  const url = `https://${SHOP}/admin/api/${API_VERSION}/themes/${DRAFT_THEME_ID}/assets.json`;
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

async function deploy() {
  console.log(`======================================================`);
  console.log(`DEPLOYING ULTRA OVERNIGHT TO DRAFT THEME ${DRAFT_THEME_ID}`);
  console.log(`Store: ${SHOP}`);
  console.log(`Live Theme (${LIVE_THEME_ID}) is 100% UNTOUCHED`);
  console.log(`======================================================\n`);

  const token = await getAccessToken();

  let successCount = 0;
  for (const relPath of filesToUpload) {
    const fullPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`  [SKIP] File not found: ${relPath}`);
      continue;
    }

    const key = relPath.replace(/\\/g, '/');
    const isBinary = /\.(png|jpg|jpeg|gif|webp|ico|woff2|woff|ttf|eot)$/i.test(relPath);

    if (isBinary) {
      const b64 = fs.readFileSync(fullPath).toString('base64');
      const ok = await uploadAsset(key, b64, token, true);
      if (ok) successCount++;
    } else {
      const content = fs.readFileSync(fullPath, 'utf8');
      const ok = await uploadAsset(key, content, token, false);
      if (ok) successCount++;
    }
  }

  console.log(`\n======================================================`);
  console.log(`DEPLOYMENT COMPLETE: ${successCount} / ${filesToUpload.length} files uploaded!`);
  console.log(`Draft Preview: https://${SHOP}/?preview_theme_id=${DRAFT_THEME_ID}`);
  console.log(`Theme Editor:  https://admin.shopify.com/store/ikwh1h-fx/themes/${DRAFT_THEME_ID}/editor`);
  console.log(`======================================================\n`);
}

deploy().catch(console.error);

