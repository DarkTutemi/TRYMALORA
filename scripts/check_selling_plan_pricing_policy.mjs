import { adminGraphql } from './config.mjs';

async function main() {
  const valueInput = await adminGraphql(`{
    __type(name: "SellingPlanPricingPolicyValueInput") {
      inputFields {
        name
        type { name kind ofType { name kind } }
      }
    }
    typeEnum: __type(name: "SellingPlanPricingPolicyAdjustmentType") {
      enumValues {
        name
        description
      }
    }
  }`);
  console.log(JSON.stringify(valueInput, null, 2));
}

main().catch(console.error);
