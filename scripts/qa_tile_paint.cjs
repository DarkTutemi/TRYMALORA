const puppeteer = require('puppeteer');
const path = require('path');

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Authenticate with storefront password
  console.log('Navigating to password page...');
  await page.goto('https://ikwh1h-fx.myshopify.com/password', { waitUntil: 'networkidle2' });
  const pwInput = await page.$('input[type="password"]');
  if (pwInput) {
    await page.type('input[type="password"]', (process.env.SHOPIFY_FLAG_STORE_PASSWORD || ''));
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.keyboard.press('Enter')
    ]);
  }

  // 2. Load Tile Refinishing Paint on Draft Theme 197144805747
  console.log('Loading Tile Refinishing on draft theme 197144805747...');
  const targetUrl = 'https://ikwh1h-fx.myshopify.com/products/tile-refinishing-paint-restoration-kit?preview_theme_id=197144805747';
  await page.goto(targetUrl, { waitUntil: 'networkidle2' });

  // Ensure preview bar is hidden
  await page.evaluate(() => {
    const bar = document.getElementById('preview-bar-iframe');
    if (bar) bar.remove();
  });

  // Evaluate PDP Elements
  const pdpInfo = await page.evaluate(() => {
    const title = document.querySelector('.zv-pdp-title')?.textContent?.trim();
    const activePrice = document.querySelector('#zvPriceActive')?.textContent?.trim();
    const ctaText = document.querySelector('#zvBtnClaimLabel')?.textContent?.trim();
    const ctaSub = document.querySelector('.zv-atc-sub')?.textContent?.trim();
    const shippingBadge = document.querySelector('#zvBundleShippingBadge')?.className;
    const shippingText = document.querySelector('#zvBundleShippingText')?.textContent?.trim();
    const colors = Array.from(document.querySelectorAll('#zvColorPills .zv-option-pill')).map(p => p.textContent.trim());
    const sizes = Array.from(document.querySelectorAll('#zvSizePills .zv-option-pill')).map(p => p.textContent.trim());
    const b1Tot = document.querySelector('#zvTileB1Total')?.textContent?.trim();
    const b2Tot = document.querySelector('#zvTileB2Total')?.textContent?.trim();
    const b3Tot = document.querySelector('#zvTileB3Total')?.textContent?.trim();
    const videoThumb = document.querySelector('.zv-pdp-thumb.video-thumb') !== null;
    const highlightBox = document.querySelector('.zv-pdp-highlight-box')?.textContent?.trim();
    const laserBattleReview = document.body.innerText.includes('The kids put down their tablets immediately');

    return {
      title,
      activePrice,
      ctaText,
      ctaSub,
      shippingBadge,
      shippingText,
      colors,
      sizes,
      b1Tot,
      b2Tot,
      b3Tot,
      videoThumb,
      highlightBox,
      laserBattleReview
    };
  });

  console.log('--- Initial PDP Evaluation (100g Default) ---');
  console.log(JSON.stringify(pdpInfo, null, 2));

  // Screenshot 1: Desktop Buy Box (100g, Buy 1)
  const brainDir = 'C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551';
  await page.screenshot({ path: path.join(brainDir, 'qa_tile_desktop_buybox.png'), clip: { x: 0, y: 0, width: 1440, height: 1100 } });
  console.log('Saved qa_tile_desktop_buybox.png');

  // Test Size Switching to 300g and selecting Buy 3 (Over $70)
  console.log('Switching to 300g and selecting Buy 3...');
  await page.evaluate(() => {
    // Click 300g pill
    const p300 = Array.from(document.querySelectorAll('#zvSizePills .zv-option-pill')).find(p => p.textContent.includes('300g'));
    if (p300) p300.click();

    // Click Buy 3 card
    const b3 = Array.from(document.querySelectorAll('.zv-tile-bundle-card')).find(c => c.getAttribute('data-bundle-tier') === '3');
    if (b3) b3.click();
  });

  await new Promise(r => setTimeout(r, 600));

  const state300gB3 = await page.evaluate(() => {
    return {
      activePrice: document.querySelector('#zvPriceActive')?.textContent?.trim(),
      ctaText: document.querySelector('#zvBtnClaimLabel')?.textContent?.trim(),
      shippingBadge: document.querySelector('#zvBundleShippingBadge')?.className,
      shippingText: document.querySelector('#zvBundleShippingText')?.textContent?.trim(),
      b3Total: document.querySelector('#zvTileB3Total')?.textContent?.trim(),
      b3Unit: document.querySelector('#zvTileB3Unit')?.textContent?.trim()
    };
  });
  console.log('--- 300g Buy 3 State ---', JSON.stringify(state300gB3, null, 2));

  await page.screenshot({ path: path.join(brainDir, 'qa_tile_300g_buy3_freeship.png'), clip: { x: 600, y: 150, width: 750, height: 800 } });
  console.log('Saved qa_tile_300g_buy3_freeship.png');

  // Test Video Thumbnail Click
  console.log('Testing video thumbnail click...');
  await page.evaluate(() => {
    const vThumb = document.querySelector('.zv-pdp-thumb.video-thumb');
    if (vThumb) vThumb.click();
  });
  await new Promise(r => setTimeout(r, 600));
  const videoState = await page.evaluate(() => {
    const vid = document.getElementById('zvMainVideo');
    return {
      displayed: vid && vid.style.display !== 'none',
      src: vid ? vid.src : null
    };
  });
  console.log('--- Video State ---', JSON.stringify(videoState, null, 2));

  // Scroll to How It Works & screenshot
  console.log('Testing How It Works image cards...');
  await page.evaluate(() => {
    const hiw = document.querySelector('.tm-hiw-section');
    if (hiw) hiw.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(brainDir, 'qa_tile_how_it_works_cards.png'), clip: { x: 0, y: 200, width: 1440, height: 950 } });
  console.log('Saved qa_tile_how_it_works_cards.png');

  // Test Mobile (390px)
  console.log('Testing Mobile Viewport (390px)...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(brainDir, 'qa_tile_mobile_buybox.png') });
  console.log('Saved qa_tile_mobile_buybox.png');

  // Scroll to Mobile How It Works
  await page.evaluate(() => {
    const hiw = document.querySelector('.tm-hiw-section');
    if (hiw) hiw.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(brainDir, 'qa_tile_mobile_how_it_works.png') });
  console.log('Saved qa_tile_mobile_how_it_works.png');

  // Also check Draft product record preview
  console.log('Checking Draft Product record preview...');
  const draftUrl = 'https://ikwh1h-fx.myshopify.com/products/tile-refinishing-paint-restoration-kit-draft?preview_theme_id=197144805747';
  await page.goto(draftUrl, { waitUntil: 'networkidle2' });
  const draftTitle = await page.evaluate(() => document.querySelector('.zv-pdp-title')?.textContent?.trim());
  console.log('Draft Product Title on Preview:', draftTitle);

  await browser.close();
  console.log('QA completed successfully!');
}

run().catch(err => {
  console.error('QA Error:', err);
  process.exit(1);
});

