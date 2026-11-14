import { getCliToken } from './config.mjs';

async function main() {
  const token = getCliToken();
  const shopifyGql = async (query, variables = {}) => {
    const res = await fetch('https://ikwh1h-fx.myshopify.com/admin/api/2026-10/graphql.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ query, variables })
    });
    return await res.json();
  };

  const res = await shopifyGql(`
    query {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            media(first: 5) {
              edges {
                node {
                  ... on MediaImage {
                    id
                    image {
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `);

  for (const p of res?.data?.products?.edges || []) {
    console.log(`\nProduct: ${p.node.title} (${p.node.handle})`);
    console.log(`Media count: ${p.node.media.edges.length}`);
    for (const m of p.node.media.edges) {
      console.log(`  - ${m.node.image?.url}`);
    }
  }
}

main().catch(console.error);

