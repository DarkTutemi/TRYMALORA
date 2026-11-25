import fs from 'fs';
import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

const DRAFT_THEME_ID = '198133088627';

async function putAsset(assetKey, value) {
  const token = await getAccessToken();
  const url = `https://${SHOP}/admin/api/${API_VERSION}/themes/${DRAFT_THEME_ID}/assets.json`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ asset: { key: assetKey, value } })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status} on ${assetKey}: ${txt}`);
  }
  return await res.json();
}

const themeLiquid = `<!doctype html>
<html class="no-js" lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{{ page_title }} – CERULINE US</title>
  {{ content_for_header }}
  {{ 'ceruline-us-base.css' | asset_url | stylesheet_tag }}
  <script src="{{ 'ceruline-us-secondary.js' | asset_url }}" defer="defer"></script>
  <script src="{{ 'ceruline-us-scripts.js' | asset_url }}" defer="defer"></script>
  <script src="{{ 'ceruline-us-media-gallery.js' | asset_url }}" defer="defer"></script>
  <script src="{{ 'ceruline-us-product-image-zoom.js' | asset_url }}" defer="defer"></script>
</head>
<body class="gradient">
  {% sections 'header-group' %}
  <main id="MainContent" class="content-for-layout focus-none" role="main" tabindex="-1">
    {{ content_for_layout }}
  </main>
  {% sections 'footer-group' %}
  {% section 'ceruline-us-cart-drawer' %}
</body>
</html>`;

const headerGroup = JSON.stringify({
  name: 'Header group',
  type: 'header',
  sections: {
    announcement: { type: 'ceruline-us-announcement', settings: {} },
    header: { type: 'ceruline-us-header', settings: {} }
  },
  order: ['announcement', 'header']
}, null, 2);

const footerGroup = JSON.stringify({
  name: 'Footer group',
  type: 'footer',
  sections: {
    footer: { type: 'ceruline-us-footer', settings: {} }
  },
  order: ['footer']
}, null, 2);

async function deploy() {
  console.log(`=== DEPLOYING TO DRAFT THEME ${DRAFT_THEME_ID} ===`);
  let ok = 0, fail = 0;

  // 1. Assets
  const assets = fs.readdirSync('assets').filter(f => f.startsWith('ceruline-us-'));
  for (const f of assets) {
    try {
      await putAsset(`assets/${f}`, fs.readFileSync(`assets/${f}`, 'utf8'));
      console.log(`✔ assets/${f}`);
      ok++;
    } catch (e) { console.error(`❌ assets/${f}:`, e.message); fail++; }
    await new Promise(r => setTimeout(r, 300));
  }

  // 2. Sections
  const sections = fs.readdirSync('sections').filter(f => f.startsWith('ceruline-us-'));
  for (const f of sections) {
    try {
      await putAsset(`sections/${f}`, fs.readFileSync(`sections/${f}`, 'utf8'));
      console.log(`✔ sections/${f}`);
      ok++;
    } catch (e) { console.error(`❌ sections/${f}:`, e.message); fail++; }
    await new Promise(r => setTimeout(r, 300));
  }

  // 3. Layout, Groups, Template
  const extras = [
    ['layout/theme.liquid', themeLiquid],
    ['sections/header-group.json', headerGroup],
    ['sections/footer-group.json', footerGroup],
    ['templates/product.ceruline-us.json', fs.readFileSync('templates/product.ceruline-us.json', 'utf8')]
  ];
  for (const [k, v] of extras) {
    try {
      await putAsset(k, v);
      console.log(`✔ ${k}`);
      ok++;
    } catch (e) { console.error(`❌ ${k}:`, e.message); fail++; }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n=== DRAFT DEPLOYMENT COMPLETE: ${ok} OK, ${fail} FAILED ===`);
}

deploy().catch(console.error);
