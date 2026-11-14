import { adminGraphql } from './config.mjs';

async function testProductSet() {
  const query = `
    query {
      __type(name: "ProductSetInput") {
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
    }
  `;
  const res = await adminGraphql(query);
  console.log(JSON.stringify(res, null, 2));
}

testProductSet();

