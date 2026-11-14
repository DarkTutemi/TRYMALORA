import { adminGraphql, SHOP } from './config.mjs';

async function main() {
  console.log('--- Checking Selling Plan Groups on', SHOP, '---');
  const query = `{
    sellingPlanGroups(first: 10) {
      nodes {
        id
        name
        merchantCode
        options
        sellingPlans(first: 10) {
          nodes {
            id
            name
            options
            pricingPolicies {
              ... on SellingPlanFixedPricingPolicy {
                adjustmentType
                adjustmentValue {
                  ... on MoneyV2 {
                    amount
                    currencyCode
                  }
                  ... on SellingPlanPricingPolicyPercentageValue {
                    percentage
                  }
                }
              }
              ... on SellingPlanRecurringPricingPolicy {
                adjustmentType
                adjustmentValue {
                  ... on MoneyV2 {
                    amount
                    currencyCode
                  }
                  ... on SellingPlanPricingPolicyPercentageValue {
                    percentage
                  }
                }
              }
            }
            deliveryPolicy {
              ... on SellingPlanRecurringDeliveryPolicy {
                interval
                intervalCount
              }
            }
            billingPolicy {
              ... on SellingPlanRecurringBillingPolicy {
                interval
                intervalCount
              }
            }
          }
        }
      }
    }
  }`;

  try {
    const res = await adminGraphql(query);
    console.log('SellingPlanGroups result:', JSON.stringify(res, null, 2));
  } catch(e) {
    console.error('Error querying sellingPlanGroups:', e.message);
  }
}

main().catch(console.error);

