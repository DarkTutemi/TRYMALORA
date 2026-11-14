import { adminGraphql } from './config.mjs';

async function main() {
  const query = `
    query {
      products(first: 20, query: "tile-refinishing") {
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

