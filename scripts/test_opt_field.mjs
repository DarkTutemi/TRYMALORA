import { adminGraphql } from './config.mjs';

async function testOptField() {
  const query = `
    query {
      __type(name: "OptionSetInput") {
        inputFields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
              ofType {
                name
              }
            }
          }
        }
      }
    }
  `;
  const res = await adminGraphql(query);
  console.log(JSON.stringify(res, null, 2));
}

testOptField();

