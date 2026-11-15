import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function publishPages() {
  const token = await getAccessToken();
  const pages = [
    { id: 717036716403, handle: 'track-order', title: 'Track Order' },
    { id: 717036683635, handle: 'about-us', title: 'Our Story — ULTRA OVERNIGHT' }
  ];

  for (const p of pages) {
    const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/pages/${p.id}.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({
        page: {
          id: p.id,
          title: p.title,
          published_at: new Date().toISOString()
        }
      })
    });
    const data = await res.json();
    console.log(`Published ${p.handle}:`, data.page?.published_at ? 'SUCCESS' : 'FAILED', data.page?.published_at);
  }
}

publishPages();

