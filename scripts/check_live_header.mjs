import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function checkThemeMenu() {
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235/assets.json?asset[key]=sections/ultra-header.liquid`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  console.log('ultra-header.liquid from Live Theme:');
  console.log(data.asset?.value);
}
checkThemeMenu();

