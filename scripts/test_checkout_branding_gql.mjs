import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  // Test checkoutBrandingUpsert
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: `mutation checkoutBrandingUpsert($checkoutBrandingInput: CheckoutBrandingInput!) {
        checkoutBrandingUpsert(checkoutBrandingInput: $checkoutBrandingInput) {
          checkoutBranding {
            designSystem {
              colors {
                global {
                  brand
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
      variables: {
        checkoutBrandingInput: {
          designSystem: {
            colors: {
              global: {
                brand: '#4B2038'
              }
            }
          }
        }
      }
    })
  });
  console.log(await res.json());
}

main().catch(console.error);

