import { getCliToken } from './config.mjs';

async function inspect() {
  const token = getCliToken();
  const query = `
    query {
      product(id: "gid://shopify/Product/15636321698163") {
        id
        title
        handle
        status
        options {
          id
          name
          values
        }
        media(first: 15) {
          edges {
            node {
              id
              mediaContentType
              ... on MediaImage {
                image {
                  url
                }
              }
              ... on Video {
                sources {
                  url
                  format
                  mimeType
                }
              }
            }
          }
        }
        variants(first: 10) {
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
  const res = await fetch('https://ikwh1h-fx.myshopify.com/admin/api/2026-10/graphql.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  console.log(JSON.stringify(data.data?.product, null, 2));
}

inspect();

