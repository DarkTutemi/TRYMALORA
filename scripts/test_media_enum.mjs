import { adminGraphql } from './config.mjs';

async function testEnum() {
  const query = `
    query {
      __type(name: "MediaContentType") {
        name
        enumValues {
          name
        }
      }
    }
  `;
  const res = await adminGraphql(query);
  console.log(JSON.stringify(res, null, 2));
}

testEnum();

