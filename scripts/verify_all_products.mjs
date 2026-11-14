import { getCliToken } from './config.mjs';

async function verifyVariants() {
  const token = getCliToken();
  const res = await fetch('https://ikwh1h-fx.myshopify.com/admin/api/2026-10/graphql.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({
      query: `
        query {
          products(first: 20) {
            edges {
              node {
                id
                title
                status
                variants(first: 20) {
                  edges {
                    node {
                      id
                      title
                      price
                      inventoryPolicy
                    }
                  }
                }
              }
            }
          }
        }
      `
    })
  });
  const json = await res.json();
  const products = json?.data?.products?.edges || [];
  for (const p of products) {
    console.log(`\nProduct: ${p.node.title} (${p.node.status})`);
    for (const v of p.node.variants.edges) {
      console.log(`  - ${v.node.title}: $${v.node.price} [Policy: ${v.node.inventoryPolicy}]`);
    }
  }
}

verifyVariants().catch(console.error);

