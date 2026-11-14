import { adminGraphql } from './config.mjs';

async function main() {
  const res = await adminGraphql(`{
    __type(name: "SellingPlanGroupInput") {
      inputFields {
        name
        type {
          name
          kind
          ofType { name kind }
        }
      }
    }
  }`);
  console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);

