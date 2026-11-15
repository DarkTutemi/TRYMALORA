import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: `query {
        files(first: 50, sortKey: CREATED_AT, reverse: true) {
          nodes {
            ... on GenericFile { id url }
            ... on MediaImage {
              id
              image {
                url
                width
                height
                altText
              }
            }
          }
        }
      }`
    })
  });
  const data = await res.json();
  const files = data.data?.files?.nodes || [];
  console.log(`Found ${files.length} files:`);
  files.forEach(f => {
    const url = f.url || f.image?.url;
    const alt = f.image?.altText || '';
    console.log(`- ${url} [${alt}]`);
  });
}

main().catch(console.error);
