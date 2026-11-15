import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function check() {
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/products/15664431104371.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  console.log('Product images count:', data.product.images?.length);
  console.log('Images:', data.product.images.map((img, i) => ({
    position: img.position,
    id: img.id,
    src: img.src,
    alt: img.alt,
    width: img.width,
    height: img.height
  })));
}
check();

