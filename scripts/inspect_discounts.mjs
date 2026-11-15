import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: `query {
        discountNodes(first: 10) {
          edges {
            node {
              id
              discount {
                ... on DiscountAutomaticApp { title }
                ... on DiscountAutomaticBasic { title }
                ... on DiscountAutomaticBxgy { title }
                ... on DiscountAutomaticFreeShipping {
                  title
                  minimumRequirement {
                    ... on DiscountMinimumSubtotal {
                      greaterThanOrEqualToSubtotal {
                        amount
                        currencyCode
                      }
                    }
                  }
                  destinationSelection {
                    ... on DiscountCountryAll { allCountries }
                    ... on DiscountCountries { countries }
                  }
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
