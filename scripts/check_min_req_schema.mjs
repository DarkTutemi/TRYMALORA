import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  const query = `
    query {
      minReq: __type(name: "DiscountMinimumRequirementInput") {
        inputFields {
          name
          type {
            name
            ofType {
              name
            }
          }
        }
      }
      custGets: __type(name: "DiscountCustomerGetsInput") {
        inputFields {
          name
          type {
            name
            ofType {
              name
            }
          }
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
  console.log('minReq:', JSON.stringify(data.data.minReq, null, 2));
  console.log('custGets:', JSON.stringify(data.data.custGets, null, 2));
}

main().catch(console.error);

