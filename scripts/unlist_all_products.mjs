import { adminGraphql } from './config.mjs';

async function unlistAllProducts() {
  console.log('--- FETCHING ACTIVE PRODUCTS ---');
  let hasNext = true;
  let cursor = null;
  let products = [];
  while (hasNext) {
    const query = `
      query getActiveProducts($cursor: String) {
        products(first: 50, after: $cursor, query: "status:ACTIVE") {
          edges {
            cursor
            node {
              id
              title
              status
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `;
    const res = await adminGraphql(query, { cursor });
    const edges = res.products.edges;
    products.push(...edges.map(e => e.node));
    hasNext = res.products.pageInfo.hasNextPage;
    if (edges.length > 0) cursor = edges[edges.length - 1].cursor;
  }

  console.log(`Found ${products.length} ACTIVE products.`);
  let successCount = 0;
  for (const p of products) {
    console.log(`Setting product to DRAFT: ${p.title} (${p.id})`);
    const mutation = `
      mutation setProductDraft($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    const res = await adminGraphql(mutation, {
      input: {
        id: p.id,
        status: 'DRAFT'
      }
    });

    if (res.productUpdate.userErrors?.length > 0) {
      console.error(`Failed to unlist ${p.title}:`, res.productUpdate.userErrors);
    } else {
      successCount++;
    }
  }

  console.log(`=== COMPLETED: ${successCount} / ${products.length} products unlisted (status set to DRAFT). ===`);
}

unlistAllProducts().catch(err => {
  console.error('Error unlisting products:', err);
});
