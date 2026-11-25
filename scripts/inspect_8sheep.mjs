import fs from 'fs';

async function inspect8sheep() {
  console.log('Fetching https://8sheep.com/...');
  try {
    const res = await fetch('https://8sheep.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log('Home status:', res.status);
    const html = await res.text();
    console.log('HTML length:', html.length);
    fs.writeFileSync('scripts/8sheep_home.html', html);

    // Look for theme info
    const themeMatch = html.match(/Shopify\.theme\s*=\s*(\{.+?\});/);
    if (themeMatch) {
      console.log('Shopify.theme:', themeMatch[1]);
    }
    const themeNameMatch = html.match(/BOOMR\.themeName\s*=\s*["']([^"']+)["']/);
    if (themeNameMatch) {
      console.log('BOOMR.themeName:', themeNameMatch[1]);
    }

    // Check stylesheets
    const cssLinks = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi)].map(m => m[1]);
    console.log('CSS links found:', cssLinks.slice(0, 10));

    // Check script tags
    const jsLinks = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
    console.log('JS links found:', jsLinks.slice(0, 10));

    // Check products.json
    const pRes = await fetch('https://8sheep.com/products.json?limit=250', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    console.log('products.json status:', pRes.status);
    if (pRes.ok) {
      const pData = await pRes.json();
      console.log('Total products in products.json:', pData.products?.length);
      fs.writeFileSync('scripts/8sheep_products.json', JSON.stringify(pData, null, 2));
      if (pData.products?.length > 0) {
        console.log('First 5 products:', pData.products.slice(0, 5).map(p => ({ title: p.title, handle: p.handle, type: p.product_type })));
      }
    }

    // Check collections.json
    const cRes = await fetch('https://8sheep.com/collections.json?limit=250', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    console.log('collections.json status:', cRes.status);
    if (cRes.ok) {
      const cData = await cRes.json();
      console.log('Total collections in collections.json:', cData.collections?.length);
      fs.writeFileSync('scripts/8sheep_collections.json', JSON.stringify(cData, null, 2));
      if (cData.collections?.length > 0) {
        console.log('Collections:', cData.collections.map(c => ({ title: c.title, handle: c.handle })));
      }
    }
  } catch (err) {
    console.error('Error fetching 8sheep:', err);
  }
}
inspect8sheep();
