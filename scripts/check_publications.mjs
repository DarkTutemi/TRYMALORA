import { getCliToken } from './config.mjs';

async function checkPubs() {
  const token = getCliToken();
  const query = `
    query {
      publications(first: 10) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `;
  const res = await fetch('https://ikwh1h-fx.myshopify.com/admin/api/2026-10/graphql.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  console.log('Publications:', JSON.stringify(data, null, 2));
}

checkPubs();

