import { getCliToken } from './config.mjs';

async function checkChannelFields() {
  const token = getCliToken();
  const query = `
    query {
      __type(name: "Channel") {
        fields {
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
  console.log('Channel fields:', data.data.__type.fields.map(f => f.name));
}

checkChannelFields();

