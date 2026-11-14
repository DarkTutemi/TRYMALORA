import { adminGraphql } from './config.mjs';

async function main() {
  const query = `
    query {
      product(id: "gid://shopify/Product/15636872003955") {
        id
        title
        handle
        variants(first: 20) {
          edges {
            node {
              id
              title
              price
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

