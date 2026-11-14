import { getCliToken } from './config.mjs';

async function testPubId() {
  const token = getCliToken();
  const mutation = `
    mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        publishable {
          availablePublicationCount
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
        id: 'gid://shopify/Product/15636321468787',
        input: [{ publicationId: 'gid://shopify/Publication/366564180339' }]
      }
    })
  });
  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

testPubId();

