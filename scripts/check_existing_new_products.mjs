import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();
  for (const handle of ['ultra-lace-period-briefs', 'ultra-comfort-period-shorts']) {
    const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/products.json?handle=${handle}`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    const data = await res.json();
    console.log(`Handle: ${handle} -> found:`, data.products?.length || 0);
  }
}

main().catch(console.error);
