import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  const query = `
    query {
      deliveryProfiles(first: 5) {
        nodes {
          id
          name
          profileLocationGroups {
            locationGroupZones(first: 10) {
              nodes {
                zone {
                  id
                  name
                  countries {
                    code {
                      countryCode
                    }
                  }
                }
                methodDefinitions(first: 10) {
                  nodes {
                    id
                    name
                    active
                    description
                    rateProvider {
                      ... on DeliveryRateDefinition {
                        price {
                          amount
                          currencyCode
                        }
                      }
                      ... on DeliveryParticipant {
                        fixedFee {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                }
              }
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
  console.log('Delivery Profiles:', JSON.stringify(data, null, 2));
}

main().catch(console.error);

