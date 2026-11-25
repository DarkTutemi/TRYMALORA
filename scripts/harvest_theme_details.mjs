import fs from 'fs';

async function harvest8sheepDetails() {
  console.log('Fetching PDP https://8sheep.com/products/sleepylotion ...');
  const pdpRes = await fetch('https://8sheep.com/products/sleepylotion', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  console.log('PDP Status:', pdpRes.status);
  const pdpHtml = await pdpRes.text();
  fs.writeFileSync('scripts/8sheep_pdp_sleepylotion.html', pdpHtml);
  console.log('PDP HTML length:', pdpHtml.length);

  // Analyze Homepage sections
  const homeHtml = fs.readFileSync('scripts/8sheep_home.html', 'utf8');

  // Extract sections from home
  const sectionMatches = [...homeHtml.matchAll(/class="shopify-section([^"]*)"/g)].map(m => m[0]);
  console.log('Homepage section count:', sectionMatches.length);

  const sectionIds = [...homeHtml.matchAll(/id="shopify-section-([^"]+)"/g)].map(m => m[1]);
  console.log('Homepage section IDs:', sectionIds);

  // Extract main navigation
  const navMatches = [...homeHtml.matchAll(/<nav[^>]*>([\s\S]*?)<\/nav>/gi)].map(m => m[1]);
  console.log('Nav found:', navMatches.length);

  // Extract fonts and styles
  const fontMatches = [...homeHtml.matchAll(/@font-face\s*\{[^}]+\}/g)].map(m => m[0]);
  console.log('Font-face declarations count:', fontMatches.length);

  // Check CSS files loaded
  const cdnCss = [...homeHtml.matchAll(/href="([^"]+\.css[^"]*)"/g)].map(m => m[1]);
  console.log('CSS URLs found:', cdnCss);

  // Check JS files loaded
  const cdnJs = [...homeHtml.matchAll(/src="([^"]+\.js[^"]*)"/g)].map(m => m[1]);
  console.log('Theme JS URLs found:', cdnJs.filter(u => u.includes('theme') || u.includes('cdn.shopify.com')));
}

harvest8sheepDetails().catch(console.error);
