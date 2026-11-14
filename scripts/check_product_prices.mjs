import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function check() {
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/products/15664431104371.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  console.log('Title:', data.product.title);
  console.log('Status:', data.product.status);
  console.log('Published at:', data.product.published_at);
  console.log('Variants price:', data.product.variants.slice(0, 4).map(v => ({ id: v.id, title: v.title, price: v.price, compare_at_price: v.compare_at_price })));
}
check();
