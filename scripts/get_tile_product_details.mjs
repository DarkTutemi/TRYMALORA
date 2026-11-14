import { adminGraphql } from './config.mjs';

async function main() {
  const query = `
    query {
      product(id: "gid://shopify/Product/15636321698163") {
        id
        title
        descriptionHtml
        vendor
        productType
        tags
        status
        media(first: 20) {
          edges {
            node {
              ... on MediaImage {
                image {
                  url
                }
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

