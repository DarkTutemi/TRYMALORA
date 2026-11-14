import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function audit() {
  const token = await getAccessToken();
  console.log(`Checking store: ${SHOP}`);
  
  // 1. Check Theme Roles
  const themesRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const themesData = await themesRes.json();
  console.log('--- Theme Roles ---');
  themesData.themes.forEach(t => {
    console.log(`ID: ${t.id} | Name: "${t.name}" | Role: ${t.role}`);
  });

  // 2. Check Draft Theme 197625381235 assets
  const assetsRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235/assets.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const assetsData = await assetsRes.json();
  const allKeys = (assetsData.assets || []).map(a => a.key);
  const ultraKeys = allKeys.filter(k => k.includes('ultra'));
  console.log('\n--- Ultra Assets on Draft Theme 197625381235 (' + ultraKeys.length + ') ---');
  ultraKeys.forEach(k => console.log('  ' + k));

  // Check missing
  const expected = [
    'sections/ultra-product-main.liquid',
    'sections/ultra-pdp-editorial.liquid',
    'sections/ultra-benefit-strip.liquid',
    'sections/ultra-five-layers.liquid',
    'sections/ultra-seven-pillars.liquid',
    'sections/ultra-lifestyle-comfort.liquid',
    'sections/ultra-hiw-steps.liquid',
    'sections/ultra-pdp-tabs.liquid',
    'sections/ultra-reviews.liquid',
    'sections/ultra-faq.liquid',
    'sections/ultra-closing-reminder.liquid',
    'templates/product.ultra-overnight.json',
    'assets/ultra-overnight.css',
    'assets/ultra-overnight.js'
  ];

  console.log('\n--- Expected PDP V2 Assets Check ---');
  expected.forEach(k => {
    const exists = allKeys.includes(k);
    console.log(`  ${k}: ${exists ? '[EXISTS]' : '[MISSING]'}`);
  });

  // 3. Inspect templates/product.ultra-overnight.json content on Draft Theme
  const tRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235/assets.json?asset[key]=templates/product.ultra-overnight.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const tData = await tRes.json();
  if (tData.asset && tData.asset.value) {
    try {
      const parsed = JSON.parse(tData.asset.value);
      console.log('\n--- templates/product.ultra-overnight.json on Draft Theme ---');
      console.log('Sections order:', parsed.order);
      console.log('Total sections in template:', parsed.order ? parsed.order.length : 0);
    } catch(e) {
      console.log('Template parse error:', e.message);
    }
  } else {
    console.log('\nTemplate NOT FOUND on theme 197625381235:', tData);
  }
}

audit();

