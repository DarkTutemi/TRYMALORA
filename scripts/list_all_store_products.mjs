import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/products.json?limit=30`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  console.log('Total products:', data.products.length);
  for (const p of data.products) {
    console.log(`- [${p.id}] ${p.title} (handle: ${p.handle}) - ${p.variants.length} variants, price: $${p.variants[0]?.price}`);
  }
}

main().catch(console.error);
