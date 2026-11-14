import fs from 'fs';

const sources = [
  { id: 1, name: 'aneedfamily', url: 'https://aneedfamily.com/products/itcb' },
  { id: 2, name: 'tbestgoal', url: 'https://tbestgoal.com/products/car-metal-rust-repair-paste' },
  { id: 3, name: 'melbob', url: 'https://melbob.com/products/metrush' },
  { id: 4, name: 'beooshop', url: 'https://beooshop.com/products/mini-dual-purpose-curling-iron-1-2' },
  { id: 5, name: 'sunbowf', url: 'https://sunbowf.com/products/car-metal-r22' },
  { id: 6, name: 'newbeew', url: 'https://newbeew.com/products/white-tile-refinishing-paint-with-brush' }
];

async function fetchSource(s) {
  console.log(`\n======================================================`);
  console.log(`Fetching Source ${s.id}: ${s.name} (${s.url})`);
  console.log(`======================================================`);

  // Try .js
  try {
    const res = await fetch(`${s.url}.js`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    if (res.ok) {
      const json = await res.json();
      console.log(`[OK .js] Title: ${json.title}`);
      console.log(`Price: ${json.price} | Compare: ${json.compare_at_price}`);
      console.log(`Variants: ${json.variants ? json.variants.length : 0}`);
      if (json.variants) {
        json.variants.forEach(v => console.log(`  - ${v.title}: ${v.price}`));
      }
      console.log(`Images: ${json.images ? json.images.length : 0}`);
      fs.writeFileSync(`scripts/source_${s.id}_data.json`, JSON.stringify(json, null, 2));
      return;
    } else {
      console.log(`[.js returned ${res.status}] Trying HTML...`);
    }
  } catch (e) {
    console.log(`[.js failed: ${e.message}] Trying HTML...`);
  }

  // Try HTML
  try {
    const res = await fetch(s.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log(`[HTML Status]: ${res.status}`);
    const html = await res.text();
    // Try to find og:title, og:image, etc.
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
    console.log(`Title tag: ${titleMatch ? titleMatch[1] : 'not found'}`);
    console.log(`OG Image: ${ogImageMatch ? ogImageMatch[1] : 'not found'}`);
    fs.writeFileSync(`scripts/source_${s.id}_page.html`, html.substring(0, 50000));
  } catch (e) {
    console.error(`Failed HTML fetch: ${e.message}`);
  }
}

async function main() {
  for (const s of sources) {
    await fetchSource(s);
  }
}

main().catch(console.error);

