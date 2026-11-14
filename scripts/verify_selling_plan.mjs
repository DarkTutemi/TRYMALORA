import { adminGraphql } from './config.mjs';

async function main() {
  const res = await adminGraphql(`{
    productByHandle(handle: "ear-cleaner") {
      id
      title
      sellingPlanGroups(first: 5) {
        nodes {
          id
          name
          sellingPlans(first: 5) {
            nodes {
              id
              name
              billingPolicy {
                ... on SellingPlanRecurringBillingPolicy {
                  interval
                  intervalCount
                }
              }
              deliveryPolicy {
                ... on SellingPlanRecurringDeliveryPolicy {
                  interval
                  intervalCount
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

