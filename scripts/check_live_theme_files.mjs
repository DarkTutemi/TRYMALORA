import { getAccessToken, SHOP } from './config.mjs';

async function main() {
  const token = await getAccessToken();
  const themeId = '197144805747'; // Live theme (role: 'main')
  const files = [
    'sections/zavelyn-v4-pdp-main.liquid',
    'assets/zavelyn-v4-pdp.js',
    'sections/trymalora-pdp-package.liquid',
    'sections/willa-cart-drawer.liquid'
  ];

  console.log(`Checking files on LIVE THEME (${themeId}):\n`);
  for (const f of files) {
    const res = await fetch(`https://${SHOP}/admin/api/2024-10/themes/${themeId}/assets.json?asset[key]=${f}`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    const data = await res.json();
    const val = data.asset?.value || '';
    const idxBuy1 = val.indexOf('data-bundle-name="Buy 1"');
    const idxBuy2 = val.indexOf('data-bundle-name="Buy 2 Get 2 FREE"');
    const hasBuy1First = idxBuy1 !== -1 && idxBuy2 !== -1 ? (idxBuy1 < idxBuy2) : 'N/A';
    const has100ml = val.includes('100ml');
    const has120ml = val.includes('120ml');
    const hasExtra10 = val.includes('EXTRA 10% OFF');
    console.log(`[FILE] ${f}`);
    console.log(`  Updated At: ${data.asset?.updated_at}`);
    console.log(`  Buy 1 comes before Buy 2: ${hasBuy1First}`);
    console.log(`  Has "100ml": ${has100ml}`);
    console.log(`  Has "120ml": ${has120ml}`);
    console.log(`  Has "EXTRA 10% OFF": ${hasExtra10}\n`);
  }
}

main().catch(console.error);
