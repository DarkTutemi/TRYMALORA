import { adminGraphql } from './config.mjs';

async function main() {
  const query = `{
    __type(name: "SellingPlanInput") {
      name
      inputFields {
        name
        type {
          name
          kind
          ofType { name kind ofType { name } }
        }
      }
    }
  }`;
  const res = await adminGraphql(query);
  console.log('SellingPlanInput:', JSON.stringify(res.__type.inputFields, null, 2));
}

main().catch(console.error);

