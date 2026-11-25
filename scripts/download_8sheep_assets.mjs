import fs from 'fs';
import path from 'path';

const assets = [
  'styles.css',
  'new-homepage.css',
  'c-global.css',
  'custom-sl.css',
  'a11y.css',
  'swiper-bundle.min.css',
  'pdp-upsell.css',
  'vendor.min.js',
  'theme.js',
  'upgrade-to-subscription.js',
  'a11y.js',
  'swiper-bundle.min.js'
];

async function downloadAssets() {
  const dir = 'scripts/8sheep_assets';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const a of assets) {
    const url = `https://8sheep.com/cdn/shop/t/158/assets/${a}`;
    console.log(`Downloading ${url}...`);
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        fs.writeFileSync(path.join(dir, a), text);
        console.log(`  -> Saved ${a} (${text.length} bytes)`);
      } else {
        console.log(`  -> Failed with status ${res.status}`);
      }
    } catch (e) {
      console.error(`  -> Error:`, e.message);
    }
  }
}

downloadAssets();
