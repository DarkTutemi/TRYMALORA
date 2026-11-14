import { adminGraphql } from './config.mjs';

async function main() {
  const query = `{
    __type(name: "ProductVariantsBulkInput") {
      name
      inputFields {
        name
        type {
          name
          kind
          ofType {
            name
            kind
          }
        }
      }
    }
  }`;
  const res = await adminGraphql(query);
  console.log('Fields:', JSON.stringify(res.__type.inputFields, null, 2));
}

main().catch(console.error);
