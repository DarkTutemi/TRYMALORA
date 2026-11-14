import { adminGraphql } from './config.mjs';

async function main() {
  const groupId = "gid://shopify/SellingPlanGroup/79959458163";
  const planId = "gid://shopify/SellingPlan/693337882995";

  console.log('Updating SellingPlan with 10% discount pricing policy...');

  const mutation = `
    mutation sellingPlanGroupUpdate($id: ID!, $input: SellingPlanGroupInput!) {
      sellingPlanGroupUpdate(id: $id, input: $input) {
        sellingPlanGroup {
          id
          name
          sellingPlans(first: 5) {
            nodes {
              id
              name
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
        userErrors {
          field
          message
        }
      }
    }
  `;

  const input = {
    sellingPlansToUpdate: [
      {
        id: planId,
        name: "Delivery Every 30 Days (Extra 10% OFF)",
        description: "Billed and delivered every 30 days with an extra 10% discount. Easy 1-click cancel anytime.",
        options: ["Every 30 Days"],
        category: "SUBSCRIPTION",
        billingPolicy: {
          recurring: {
            interval: "DAY",
            intervalCount: 30
          }
        },
        deliveryPolicy: {
          recurring: {
            interval: "DAY",
            intervalCount: 30
          }
        },
        pricingPolicies: [
          {
            fixed: {
              adjustmentType: "PERCENTAGE",
              adjustmentValue: {
                percentage: 10.0
              }
            }
          }
        ]
      }
    ]
  };

  const res = await adminGraphql(mutation, { id: groupId, input });
  console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);

