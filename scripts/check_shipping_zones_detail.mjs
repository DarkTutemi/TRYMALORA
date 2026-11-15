import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/shipping_zones.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  console.log('SHIPPING ZONES FULL:');
  for (const z of data.shipping_zones) {
    console.log(`\nZone: ${z.name} (id: ${z.id})`);
    console.log('Countries count:', z.countries.length);
    const hasUS = z.countries.some(c => c.code === 'US');
    console.log('Includes US:', hasUS);
    console.log('Price based rates:', z.price_based_shipping_rates);
    console.log('Weight based rates:', z.weight_based_shipping_rates);
  }
}

main().catch(console.error);
