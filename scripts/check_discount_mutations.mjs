import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  const query = `
    query {
      __type(name: "Mutation") {
        fields {
          name
        }
      }
    }
  `;

  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  const discMutations = data.data.__type.fields
    .map(f => f.name)
    .filter(n => n.toLowerCase().includes('discount'));
  console.log('Discount mutations:', discMutations);
}

main().catch(console.error);

