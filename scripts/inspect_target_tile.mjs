import { adminGraphql } from './config.mjs';

async function main() {
  const query = `
    query {
      product(id: "gid://shopify/Product/15636321698163") {
        id
        title
        handle
        status
        templateSuffix
        options {
          id
          name
          values
        }
        variants(first: 20) {
          edges {
            node {
              id
              title
              price
              inventoryPolicy
              selectedOptions {
                name
                value
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

main();
