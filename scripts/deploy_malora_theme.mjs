import { getAccessToken, SHOP, API_VERSION } from './config.mjs';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const TARGET_THEME_ID = '197625381235';

function sha256(str) {
  const normalized = str.replace(/\r\n/g, '\n').trim();
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

const filesToDeploy = [
  // Layout & Config
  'layout/theme.liquid',
  'sections/header-group.json',
  'sections/footer-group.json',
  'templates/index.json',
  'templates/product.json',

  // Sections
  'sections/malora-announcement-bar.liquid',
  'sections/malora-header.liquid',
  'sections/malora-hero.liquid',
  'sections/malora-collection-tabs.liquid',
  'sections/malora-testimonials.liquid',
  'sections/malora-bar-icons.liquid',
  'sections/malora-magnesium-science.liquid',
  'sections/malora-clean-ingredients.liquid',
  'sections/malora-founder-story.liquid',
  'sections/malora-reviews-swiper.liquid',
  'sections/malora-faq.liquid',
  'sections/malora-featured-collection.liquid',
  'sections/malora-footer.liquid',
  'sections/malora-product-main.liquid',

  // Theme Assets (CSS & JS)
  'assets/styles.css',
  'assets/new-homepage.css',
  'assets/c-global.css',
  'assets/custom-sl.css',
  'assets/a11y.css',
  'assets/swiper-bundle.min.css',
  'assets/pdp-upsell.css',
  'assets/vendor.min.js',
  'assets/theme.js',
  'assets/upgrade-to-subscription.js',
  'assets/a11y.js',
  'assets/swiper-bundle.min.js'
];

async function putAsset(themeId, assetKey, content) {
  const token = await getAccessToken();
  const url = `https://${SHOP}/admin/api/${API_VERSION}/themes/${themeId}/assets.json`;
  const isBinary = assetKey.endsWith('.jpg') || assetKey.endsWith('.png');
  const body = isBinary
    ? { asset: { key: assetKey, attachment: content.toString('base64') } }
    : { asset: { key: assetKey, value: content } };

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to upload ${assetKey} (HTTP ${res.status}): ${txt}`);
  }
  return await res.json();
}

async function verifyAsset(themeId, assetKey, localContent) {
  const token = await getAccessToken();
  const url = `https://${SHOP}/admin/api/${API_VERSION}/themes/${themeId}/assets.json?asset[key]=${encodeURIComponent(assetKey)}`;
  const res = await fetch(url, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  if (!res.ok) return false;
  const json = await res.json();
  const remoteVal = json.asset?.value || '';
  return sha256(localContent) === sha256(remoteVal);
}

async function deploy() {
  console.log(`=== DEPLOYING MALORA ORGANICS CLONE TO LIVE THEME ${TARGET_THEME_ID} ===\n`);
  let deployed = 0;
  let verified = 0;

  for (let i = 0; i < filesToDeploy.length; i++) {
    const relPath = filesToDeploy[i];
    const assetKey = relPath.replace(/\\/g, '/');
    const localContent = fs.readFileSync(relPath, 'utf8');

    console.log(`[${i + 1}/${filesToDeploy.length}] Uploading ${assetKey} (${localContent.length} chars)...`);
    try {
      await putAsset(TARGET_THEME_ID, assetKey, localContent);
      deployed++;

      // Verify Read-After-Write SHA-256 for non-binary assets
      const match = await verifyAsset(TARGET_THEME_ID, assetKey, localContent);
      if (match) {
        console.log(`  -> ✔ SHA-256 VERIFIED MATCH`);
        verified++;
      } else {
        console.log(`  -> ⚠ SHA-256 Verification warning (may be normal if remote normalized)`);
      }
    } catch (e) {
      console.error(`  -> ❌ FAILED ${assetKey}:`, e.message);
    }

    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\n=== DEPLOYMENT SUMMARY ===`);
  console.log(`Deployed: ${deployed}/${filesToDeploy.length}`);
  console.log(`Verified: ${verified}/${filesToDeploy.length}`);
}

deploy().catch(console.error);
