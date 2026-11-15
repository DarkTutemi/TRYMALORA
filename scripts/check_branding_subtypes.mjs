import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: `query {
        customizations: __type(name: "CheckoutBrandingCustomizationsInput") {
          inputFields {
            name
            type {
              name
              kind
              ofType { name kind }
            }
          }
        }
        designSystem: __type(name: "CheckoutBrandingDesignSystemInput") {
          inputFields {
            name
            type {
              name
              kind
              ofType { name kind }
            }
          }
        }
      }`
    })
  });
  console.log(JSON.stringify(await res.json(), null, 2));
}

main().catch(console.error);

