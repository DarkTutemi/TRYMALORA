import { adminGraphql } from './config.mjs';

async function testSchema() {
  const query = `
    query {
      __type(name: "CreateMediaInput") {
        name
        inputFields {
          name
          type {
            name
            kind
            ofType {
              name
            }
          }
        }
      }
    }
  `;
  const res = await adminGraphql(query);
  console.log(JSON.stringify(res, null, 2));
}

testSchema();

