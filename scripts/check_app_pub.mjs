import { getCliToken } from './config.mjs';

async function checkAppPub() {
  const token = getCliToken();
  const query = `
    query {
      currentAppInstallation {
        id
        publication {
          id
          name
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
  console.log('App Publication:', JSON.stringify(data, null, 2));
}

checkAppPub();

