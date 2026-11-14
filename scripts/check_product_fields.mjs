import { getCliToken } from './config.mjs';

async function checkProductFields() {
  const token = getCliToken();
  const query = `
    query {
      __type(name: "Product") {
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
  const fields = data.data.__type.fields.map(f => f.name).filter(n => n.toLowerCase().includes('publish') || n.toLowerCase().includes('channel'));
  console.log('Publish/Channel fields on Product:', fields);
}

checkProductFields();

