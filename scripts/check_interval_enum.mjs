import { adminGraphql } from './config.mjs';

async function main() {
  const res = await adminGraphql(`{
    __type(name: "SellingPlanInterval") {
      enumValues {
        name
        description
      }
    }
  }`);
  console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);

