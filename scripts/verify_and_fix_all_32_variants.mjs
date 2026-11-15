import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/products/15664431104371.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  const variants = data.product.variants;
  console.log(`Checking ${variants.length} variants:`);
  
  const needUpdate = [];
  for (const v of variants) {
    if (v.inventory_policy !== 'continue' || v.price !== '39.99' || v.compare_at_price !== '79.98') {
      needUpdate.push(v);
    }
  }

  console.log(`Variants needing update: ${needUpdate.length}`);
  if (needUpdate.length > 0) {
    for (const v of needUpdate) {
      const putRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/variants/${v.id}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token
        },
        body: JSON.stringify({
          variant: {
            id: v.id,
            price: '39.99',
            compare_at_price: '79.98',
            inventory_policy: 'continue'
          }
        })
      });
      console.log(`Updated variant ${v.title} (${v.id}): HTTP ${putRes.status}`);
    }
  }
}

main().catch(console.error);

