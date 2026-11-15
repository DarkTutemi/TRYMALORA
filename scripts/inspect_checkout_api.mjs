import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  // Check shop details and checkout capabilities
  const shopRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: `query {
        shop {
          name
          plan {
            displayName
            partnerDevelopment
            shopifyPlus
          }
          checkoutApiSupported
        }
      }`
    })
  });
  const shopData = await shopRes.json();
  console.log('Shop details:', JSON.stringify(shopData, null, 2));

  // Check standard checkout settings via REST on the live theme
  const TARGET_THEME_ID = '197625381235';
  const assetRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${TARGET_THEME_ID}/assets.json?asset[key]=config/settings_data.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const assetData = await assetRes.json();
  const currentSettings = JSON.parse(assetData.asset.value).current;
  const checkoutKeys = Object.keys(currentSettings).filter(k => k.startsWith('checkout_'));
  console.log('Current checkout_ keys in settings_data.json:', checkoutKeys);
}

main().catch(console.error);

