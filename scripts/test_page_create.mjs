import { getCliToken } from './config.mjs';

async function testPageCreate() {
  const token = getCliToken();
  const mutation = `
    mutation pageCreate($page: PageCreateInput!) {
      pageCreate(page: $page) {
        page {
          id
          title
          handle
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
        page: {
          title: 'Track Your Order',
          handle: 'track-order',
          templateSuffix: 'track-order'
        }
      }
    })
  });
  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

testPageCreate();

