import { SHOP, CLIENT_ID, CLIENT_SECRET } from './config.mjs';

const shop = SHOP;
const clientId = process.env.SHOPIFY_CLIENT_ID || CLIENT_ID;
const clientSecret = process.env.SHOPIFY_API_SECRET || CLIENT_SECRET;

async function getToken() {
  if (!clientId || !clientSecret) {
    console.log('No client credentials configured.');
    return;
  }
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials'
    })
  });
  const data = await res.json();
  console.log('Status:', res.status, 'Response:', data);
}
getToken().catch(console.error);
