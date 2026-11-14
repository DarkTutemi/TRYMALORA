import { adminGraphql } from './config.mjs';

async function main() {
  const query = `{
    __type(name: "SellingPlanGroupInput") {
      name
      inputFields {
        name
        type {
          name
          kind
          ofType { name kind }
        }
      }
    }
  }`;
  const res = await adminGraphql(query);
  console.log('SellingPlanGroupInput:', JSON.stringify(res.__type.inputFields, null, 2));
}

main().catch(console.error);

