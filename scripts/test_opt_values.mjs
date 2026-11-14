import { adminGraphql } from './config.mjs';

async function testOptValues() {
  const query = `
    query {
      optVal: __type(name: "OptionSetValueInput") {
        name
        inputFields {
          name
        }
      }
      varOptVal: __type(name: "VariantOptionValueInput") {
        name
        inputFields {
          name
        }
      }
    }
  `;
  const res = await adminGraphql(query);
  console.log(JSON.stringify(res, null, 2));
}

testOptValues();

