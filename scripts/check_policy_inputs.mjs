import { adminGraphql } from './config.mjs';

async function main() {
  const recurring = await adminGraphql(`{
    recurringBilling: __type(name: "SellingPlanRecurringBillingPolicyInput") {
      inputFields {
        name
        type { name kind ofType { name kind } }
      }
    }
    recurringDelivery: __type(name: "SellingPlanRecurringDeliveryPolicyInput") {
      inputFields {
        name
        type { name kind ofType { name kind } }
      }
    }
  }`);
  console.log(JSON.stringify(recurring, null, 2));
}

main().catch(console.error);
