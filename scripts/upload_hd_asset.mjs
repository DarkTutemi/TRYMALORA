import { getAccessToken, SHOP, API_VERSION, THEME_ID } from './config.mjs';
import fs from 'fs';

async function uploadHdAsset() {
  const token = await getAccessToken(true);
  const imgBuffer = fs.readFileSync('assets/trymalora_jeweled_ornaments_set_hd.png');
  const base64 = imgBuffer.toString('base64');
  const assetKey = 'assets/trymalora_jeweled_ornaments_set_hd.png';

  const putUrl = `https://${SHOP}/admin/api/${API_VERSION}/themes/${THEME_ID}/assets.json`;
  const res = await fetch(putUrl, {
    method: 'PUT',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      asset: {
        key: assetKey,
        attachment: base64
      }
    })
  });

  const data = await res.json();
  if (data.asset) {
    console.log('✔ HD Asset uploaded successfully!');
    console.log('Public URL:', data.asset.public_url);
  } else {
    console.error('Failed to upload HD asset:', data);
  }
}

uploadHdAsset().catch(console.error);

