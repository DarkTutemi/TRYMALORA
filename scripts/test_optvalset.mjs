import { adminGraphql } from './config.mjs';

async function main() {
  const query = `{
    __type(name: "Mutation") {
      fields {
        name
        args {
          name
          type {
            name
            kind
            ofType {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
    }
  }`;
  const res = await adminGraphql(query);
  const m = res.__type.fields.find(f => f.name === 'productVariantsBulkUpdate');
  console.log('productVariantsBulkUpdate:', JSON.stringify(m, null, 2));
}

main().catch(console.error);
