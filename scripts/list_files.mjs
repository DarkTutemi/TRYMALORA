import { adminGraphql } from './config.mjs';

async function listFiles() {
  const query = `
    query {
      files(first: 20) {
        edges {
          node {
            id
            createdAt
            ... on Video {
              id
              originalSource {
                url
              }
            }
            ... on MediaImage {
              id
              image {
                url
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

listFiles();

