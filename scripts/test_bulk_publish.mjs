import { getCliToken } from './config.mjs';

async function testBulkPublish() {
  const token = getCliToken();
  const mutation = `
    mutation productBulkPublish($productIds: [ID!]!, $publishToAll: AllPublicationsPublishContext) {
      productBulkPublish(productIds: $productIds, publishToAll: $publishToAll) {
        userErrors {
          field
          message
        }
        job {
          id
          done
        }
      }
    }
  `;
  const res = await fetch('https://ikwh1h-fx.myshopify.com/admin/api/2026-10/graphql.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({
      query: mutation,
      variables: {
        productIds: [
          'gid://shopify/Product/15636321403251',
          'gid://shopify/Product/15636321468787',
          'gid://shopify/Product/15636321567091',
          'gid://shopify/Product/15636321599859',
          'gid://shopify/Product/15636321698163'
        ],
        publishToAll: {
          catalogTypes: ['APP', 'MARKET']
        }
      }
    })
  });
  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

testBulkPublish();

