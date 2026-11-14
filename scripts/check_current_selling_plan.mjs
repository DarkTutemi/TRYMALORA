import { adminGraphql } from './config.mjs';

async function main() {
  const res = await adminGraphql(`{
    sellingPlanGroup(id: "gid://shopify/SellingPlanGroup/79959458163") {
      id
      name
      merchantCode
      options
      sellingPlans(first: 5) {
        nodes {
          id
          name
          description
          category
          pricingPolicies {
            ... on SellingPlanFixedPricingPolicy {
              adjustmentType
              adjustmentValue {
                ... on SellingPlanPricingPolicyPercentageValue {
                  percentage
                }
              }
            }
          }
        }
      }
    }
  }`);
  console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);

