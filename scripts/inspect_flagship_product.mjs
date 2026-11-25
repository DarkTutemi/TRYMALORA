import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/products/15664431104371.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  const p = data.product;
  console.log('Title:', p.title);
  console.log('Handle:', p.handle);
  console.log('Product Type:', p.product_type);
  console.log('Vendor:', p.vendor);
  console.log('Status:', p.status);
  console.log('Template Suffix:', p.template_suffix);
  console.log('Tags:', p.tags);
  console.log('Options:', p.options.map(o => ({ name: o.name, values: o.values })));
  console.log('Variant count:', p.variants.length);
  console.log('First variant:', p.variants[0]);
  console.log('Images count:', p.images.length);
  console.log('Images:', p.images.map(i => i.src));
}

main().catch(console.error);

