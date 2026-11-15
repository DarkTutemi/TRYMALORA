import { getAccessToken, SHOP, API_VERSION } from './config.mjs';
import fs from 'fs';

const TARGET_THEME_ID = '197625381235';

async function main() {
  const token = await getAccessToken();

  // 1. Deploy settings_schema.json
  const schemaContent = fs.readFileSync('config/settings_schema.json', 'utf8');
  console.log('Uploading config/settings_schema.json...');
  const resSchema = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${TARGET_THEME_ID}/assets.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      asset: { key: 'config/settings_schema.json', value: schemaContent }
    })
  });
  console.log('Schema upload status:', resSchema.status);

  // 2. Upload assets/ultra-checkout-logo.png to theme assets
  const logoBuf = fs.readFileSync('assets/ultra-checkout-logo.png');
  console.log('Uploading assets/ultra-checkout-logo.png to theme...');
  const resLogo = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${TARGET_THEME_ID}/assets.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      asset: { key: 'assets/ultra-checkout-logo.png', attachment: logoBuf.toString('base64') }
    })
  });
  console.log('Logo upload status:', resLogo.status);

  // 3. Deploy settings_data.json
  const dataContent = fs.readFileSync('config/settings_data.json', 'utf8');
  console.log('Uploading config/settings_data.json...');
  const resData = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${TARGET_THEME_ID}/assets.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      asset: { key: 'config/settings_data.json', value: dataContent }
    })
  });
  console.log('Settings data upload status:', resData.status);
  const dataJson = await resData.json();
  console.log('Response:', JSON.stringify(dataJson, null, 2));
}

main().catch(console.error);

