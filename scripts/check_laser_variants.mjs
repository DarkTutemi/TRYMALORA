import { adminGraphql } from './config.mjs';

async function main() {
  const query = `
    query {
      product(id: "gid://shopify/Product/15634594693427") {
        id
        title
        handle
        variants(first: 10) {
          edges {
            node {
              id
              title
              price
              compareAtPrice
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

