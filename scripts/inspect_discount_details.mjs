import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: `query {
        d1: discountNode(id: "gid://shopify/DiscountAutomaticNode/1798366232947") {
          id
          discount {
            __typename
            ... on DiscountAutomaticBasic {
              title
              status
              startsAt
              endsAt
              customerGets {
                value {
                  ... on DiscountPercentage { percentage }
                }
                items {
                  ... on DiscountProducts {
                    products(first: 10) {
                      nodes { id title handle }
                    }
                  }
                  ... on DiscountCollections {
                    collections(first: 10) {
                      nodes { id title handle }
                    }
                  }
                  ... on AllDiscountItems { allItems }
                }
              }
              minimumRequirement {
                ... on DiscountMinimumQuantity {
                  greaterThanOrEqualToQuantity
                }
                ... on DiscountMinimumSubtotal {
                  greaterThanOrEqualToSubtotal { amount currencyCode }
                }
              }
            }
          }
        }
        d2: discountNode(id: "gid://shopify/DiscountAutomaticNode/1798366265715") {
          id
          discount {
            __typename
            ... on DiscountAutomaticBasic {
              title
              status
              customerGets {
                value {
                  ... on DiscountPercentage { percentage }
                }
                items {
                  ... on DiscountProducts {
                    products(first: 10) {
                      nodes { id title handle }
                    }
                  }
                  ... on DiscountCollections {
                    collections(first: 10) {
                      nodes { id title handle }
                    }
                  }
                  ... on AllDiscountItems { allItems }
                }
              }
              minimumRequirement {
                ... on DiscountMinimumQuantity {
                  greaterThanOrEqualToQuantity
                }
              }
            }
          }
        }
      }`
    })
  });
  console.log(JSON.stringify(await res.json(), null, 2));
}

main().catch(console.error);

