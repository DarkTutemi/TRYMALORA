import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();
  console.log('SHOP:', SHOP);
  console.log('API_VERSION:', API_VERSION);
  console.log('Token exists:', !!token);

  // 1. Query all themes on this shop
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  console.log('\n--- Themes on ' + SHOP + ' ---');
  data.themes.forEach(t => {
    console.log(`  ID: ${t.id} | Name: "${t.name}" | Role: ${t.role} | Updated: ${t.updated_at}`);
  });

  // 2. Query theme 197625381235 directly
  const themeRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const tData = await themeRes.json();
  console.log('\n--- Theme 197625381235 Details ---');
  console.log(JSON.stringify(tData, null, 2));

  // 3. Read template asset
  const assetRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235/assets.json?asset[key]=templates/product.ultra-overnight.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const aData = await assetRes.json();
  console.log('\n--- templates/product.ultra-overnight.json on 197625381235 ---');
  console.log(aData.asset?.value);

  // 4. Read ultra-overnight.js
  const jsRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235/assets.json?asset[key]=assets/ultra-overnight.js`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const jsData = await jsRes.json();
  const jsVal = jsData.asset?.value || '';
  const jsLines = jsVal ? jsVal.split('\n').length : 0;
  console.log('\n--- assets/ultra-overnight.js on 197625381235 ---');
  console.log('Line count:', jsLines);
  console.log('has window.uoState:', jsVal.includes('window.uoState'));
  console.log('has getUoCartPayload:', jsVal.includes('getUoCartPayload'));

  // 5. Read ultra-product-main.liquid
  const mainRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235/assets.json?asset[key]=sections/ultra-product-main.liquid`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const mainData = await mainRes.json();
  const mainVal = mainData.asset?.value || '';
  const mainLines = mainVal ? mainVal.split('\n').length : 0;
  console.log('\n--- sections/ultra-product-main.liquid on 197625381235 ---');
  console.log('Line count:', mainLines);
  console.log('has 30-Day Guarantee:', mainVal.includes('30-Day'));
  console.log('has Thoughtful Craft:', mainVal.includes('Thoughtful'));

  // 6. Check ultra-hiw-steps.liquid
  const hiwRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235/assets.json?asset[key]=sections/ultra-hiw-steps.liquid`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const hiwData = await hiwRes.json();
  console.log('\n--- sections/ultra-hiw-steps.liquid status:', hiwRes.status, 'has asset:', !!hiwData.asset);

  // 7. Check ultra-closing-reminder.liquid
  const crRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235/assets.json?asset[key]=sections/ultra-closing-reminder.liquid`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const crData = await crRes.json();
  console.log('\n--- sections/ultra-closing-reminder.liquid status:', crRes.status, 'has asset:', !!crData.asset);
}

main();
