import { adminGraphql } from './config.mjs';

async function main() {
  const query = `
    query {
      collections(first: 20) {
        edges {
          node {
            id
            title
            handle
            productsCount {
              count
            }
          }
        }
      }
      products(first: 20, query: "status:ACTIVE") {
        edges {
          node {
            id
            title
            handle
            status
          }
        }
      }
    }
  `;
  const res = await adminGraphql(query);
  console.log(JSON.stringify(res, null, 2));
}

main();
