import { getCliToken } from './config.mjs';

async function testPublish() {
  const token = getCliToken();
  // First, find publication id for Online Store
  // Often it's available via shop { publicationCount } or we can check publications or publishablePublish
  // In Shopify GraphQL 2026-10:
  // mutation publishablePublish($id: ID!, $input: [PublicationInput!]!)
  // Or productPublish
  const mutation = `
    mutation productPublish($id: ID!) {
      productPublish(id: $id) {
        product {
          id
          onlineStoreUrl
        }
        userErrors {
          field
          message
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
        id: 'gid://shopify/Product/15636321468787'
      }
    })
  });
  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

testPublish();

