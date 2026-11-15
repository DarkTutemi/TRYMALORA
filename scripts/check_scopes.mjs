import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  const res = await fetch(`https://${SHOP}/admin/oauth/access_scopes.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  if (res.ok) {
    const data = await res.json();
    console.log('ACCESS SCOPES:', data.access_scopes.map(s => s.handle));
  } else {
    console.log('oauth access_scopes status:', res.status);
  }
}

main().catch(console.error);
