import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: `query {
        files(first: 50, reverse: true) {
          edges {
            node {
              ... on GenericFile { id url }
              ... on MediaImage { id image { url originalSrc width height } }
            }
          }
        }
      }`
    })
  });
  const data = await res.json();
  const files = data.data.files.edges.map(e => e.node);
  console.log('Total files found:', files.length);
  files.forEach(f => {
    const url = f.url || f.image?.url;
    console.log(`- ${url}`);
  });
}

main().catch(console.error);

