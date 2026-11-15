import { getAccessToken, SHOP, API_VERSION } from './config.mjs';
import fs from 'fs';
import path from 'path';

async function main() {
  const token = await getAccessToken();
  const filePath = path.resolve('assets/ultra-checkout-logo.png');
  const fileStats = fs.statSync(filePath);
  const fileBuffer = fs.readFileSync(filePath);

  console.log(`Uploading ${filePath} (${fileStats.size} bytes)...`);

  // Step 1: stagedUploadsCreate
  const stagedRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets {
            url
            resourceUrl
            parameters {
              name
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
      variables: {
        input: [{
          resource: 'IMAGE',
          filename: 'ultra-checkout-logo.png',
          mimeType: 'image/png',
          fileSize: fileStats.size.toString(),
          httpMethod: 'POST'
        }]
      }
    })
  });

  const stagedData = await stagedRes.json();
  const target = stagedData.data.stagedUploadsCreate.stagedTargets[0];
  console.log('Staged upload target URL:', target.url);

  // Step 2: Post to staged target
  const formData = new FormData();
  for (const param of target.parameters) {
    formData.append(param.name, param.value);
  }
  const blob = new Blob([fileBuffer], { type: 'image/png' });
  formData.append('file', blob, 'ultra-checkout-logo.png');

  const uploadRes = await fetch(target.url, {
    method: 'POST',
    body: formData
  });

  if (!uploadRes.ok) {
    console.error('Failed to post staged file:', uploadRes.status, await uploadRes.text());
    process.exit(1);
  }
  console.log('Staged file post status:', uploadRes.status);

  // Step 3: fileCreate
  const fileCreateRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: `mutation fileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files {
            id
            fileStatus
            alt
            createdAt
            ... on MediaImage {
              image {
                url
                originalSrc
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
      variables: {
        files: [{
          originalSource: target.resourceUrl,
          contentType: 'IMAGE',
          alt: 'ULTRA OVERNIGHT™'
        }]
      }
    })
  });

  const createData = await fileCreateRes.json();
  console.log('File create response:', JSON.stringify(createData, null, 2));

  // Poll for file to be ready
  const fileId = createData.data.fileCreate.files[0]?.id;
  if (!fileId) {
    console.error('No file ID returned!');
    process.exit(1);
  }

  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const checkRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify({
        query: `query {
          node(id: "${fileId}") {
            ... on MediaImage {
              fileStatus
              image {
                url
              }
            }
          }
        }`
      })
    });
    const checkData = await checkRes.json();
    const status = checkData.data.node?.fileStatus;
    const url = checkData.data.node?.image?.url;
    console.log(`Poll ${i+1}: status=${status}, url=${url}`);
    if (status === 'READY') {
      console.log('\nFINAL READY IMAGE URL:', url);
      fs.writeFileSync('scripts/checkout_logo_url.txt', url);
      break;
    }
  }
}

main().catch(console.error);

