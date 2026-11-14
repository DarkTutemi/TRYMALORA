import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function checkAllThemes() {
  const token = await getAccessToken();
  const themeIds = [
    '197144805747', // Live theme
    '197111513459', // Showroom V4
    '197625381235'  // Ultra Overnight Draft
  ];

  for (const tid of themeIds) {
    console.log(`\n================ Checking Theme ${tid} ================`);
    const tRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${tid}.json`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    const tData = await tRes.json();
    console.log(`Name: "${tData.theme?.name}" | Role: ${tData.theme?.role} | Updated: ${tData.theme?.updated_at}`);

    // Check templates/product.ultra-overnight.json
    const aRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${tid}/assets.json?asset[key]=templates/product.ultra-overnight.json`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    if (aRes.ok) {
      const aData = await aRes.json();
      try {
        const parsed = JSON.parse(aData.asset.value);
        console.log(`templates/product.ultra-overnight.json exists! Sections count: ${parsed.order?.length}`);
        console.log(`Sections: ${parsed.order?.join(', ')}`);
      } catch(e) {
        console.log(`Parse error: ${e.message}`);
      }
    } else {
      console.log(`templates/product.ultra-overnight.json: NOT PRESENT (${aRes.status})`);
    }

    // Check ultra-product-main.liquid
    const pRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${tid}/assets.json?asset[key]=sections/ultra-product-main.liquid`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    if (pRes.ok) {
      const pData = await pRes.json();
      const val = pData.asset.value || '';
      console.log(`sections/ultra-product-main.liquid lines: ${val.split('\n').length}, has 30-Day: ${val.includes('30-Day')}`);
    } else {
      console.log(`sections/ultra-product-main.liquid: NOT PRESENT`);
    }

    // Check ultra-overnight.js
    const jRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${tid}/assets.json?asset[key]=assets/ultra-overnight.js`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    if (jRes.ok) {
      const jData = await jRes.json();
      const val = jData.asset.value || '';
      console.log(`assets/ultra-overnight.js lines: ${val.split('\n').length}, has uoState: ${val.includes('uoState')}`);
    } else {
      console.log(`assets/ultra-overnight.js: NOT PRESENT`);
    }
  }
}

checkAllThemes();

