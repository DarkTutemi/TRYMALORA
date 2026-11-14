import { adminGraphql } from './config.mjs';

async function main() {
  const res = await adminGraphql(`{
    __type(name: "VariantOptionValueInput") {
      inputFields {
        name
        type {
          name
          kind
        }
      }
    }
  }`);
  console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);
