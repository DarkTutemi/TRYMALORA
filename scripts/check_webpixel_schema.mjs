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
            }
          }
        }
      }
    }
  }`;
  const res = await adminGraphql(query);
  const m = res.__type.fields.find(f => f.name === 'webPixelCreate');
  console.log('webPixelCreate args:', JSON.stringify(m.args, null, 2));

  // Also inspect input type
  const inTypeQuery = `{
    __type(name: "WebPixelInput") {
      inputFields {
        name
        type {
          name
          kind
          ofType { name }
        }
      }
    }
  }`;
  const inTypeRes = await adminGraphql(inTypeQuery);
  console.log('WebPixelInput fields:', JSON.stringify(inTypeRes.__type.inputFields, null, 2));
}

main().catch(console.error);

