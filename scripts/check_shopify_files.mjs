import { adminGraphql } from './config.mjs';

async function checkFiles() {
  const query = `
    query {
      files(first: 20, query: "22d393cbbfef4b1fa48284f0595279e4") {
        edges {
          node {
            id
            ... on Video {
              id
              originalSource {
                url
              }
              sources {
                url
                format
                mimeType
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

checkFiles();

