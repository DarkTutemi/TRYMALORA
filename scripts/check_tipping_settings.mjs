import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  // Check shop settings via REST
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/shop.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  console.log('Shop settings keys:', Object.keys(data.shop));
  console.log('checkout / tipping related fields:');
  for (const [k, v] of Object.entries(data.shop)) {
    if (k.toLowerCase().includes('tip') || k.toLowerCase().includes('checkout')) {
      console.log(`  ${k}: ${v}`);
    }
  }
}

main().catch(console.error);

