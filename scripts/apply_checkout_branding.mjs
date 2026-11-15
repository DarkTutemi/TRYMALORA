import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  console.log('Applying Checkout Branding via GraphQL on profile gid://shopify/CheckoutProfile/34086093171...');
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: `mutation checkoutBrandingUpsert($checkoutProfileId: ID!, $checkoutBrandingInput: CheckoutBrandingInput!) {
        checkoutBrandingUpsert(checkoutProfileId: $checkoutProfileId, checkoutBrandingInput: $checkoutBrandingInput) {
          checkoutBranding {
            customizations {
              header {
                logo {
                  image {
                    url
                  }
                }
              }
            }
            designSystem {
              colors {
                global {
                  brand
                  accent
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
        checkoutProfileId: 'gid://shopify/CheckoutProfile/34086093171',
        checkoutBrandingInput: {
          customizations: {
            header: {
              logo: {
                image: {
                  mediaImageId: 'gid://shopify/MediaImage/59235988177267'
                },
                maxWidth: 240
              },
              alignment: 'START'
            }
          },
          designSystem: {
            colors: {
              global: {
                brand: '#4B2038',
                accent: '#4B2038'
              }
            }
          }
        }
      }
    })
  });

  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

main().catch(console.error);
