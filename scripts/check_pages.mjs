import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function checkPages() {
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/pages.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  console.log('Shopify Pages count:', data.pages?.length);
  for (const p of data.pages || []) {
    console.log(`Page: id=${p.id}, title="${p.title}", handle="${p.handle}", template_suffix="${p.template_suffix}"`);
  }
}
checkPages();

