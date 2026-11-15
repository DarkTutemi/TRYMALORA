import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551';

async function verifyPages() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Test 1: About Us Page on Desktop (1440px)
  console.log('Testing https://trymalora.com/pages/about-us (Desktop 1440px)...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('https://trymalora.com/pages/about-us', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'qa_about_us_desktop_1440.png'), fullPage: true });
  console.log('Saved qa_about_us_desktop_1440.png');

  // Test 2: About Us Page on Mobile (390px iPhone)
  console.log('Testing https://trymalora.com/pages/about-us (Mobile 390px)...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto('https://trymalora.com/pages/about-us', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'qa_about_us_mobile_390.png'), fullPage: true });
  console.log('Saved qa_about_us_mobile_390.png');

  // Test 3: Track Order Page on Desktop & Mobile
  console.log('Testing https://trymalora.com/pages/track-order (Desktop 1440px)...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('https://trymalora.com/pages/track-order', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'qa_track_order_desktop_1440.png'), fullPage: true });
  console.log('Saved qa_track_order_desktop_1440.png');

  console.log('Testing https://trymalora.com/pages/track-order (Mobile 390px)...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto('https://trymalora.com/pages/track-order', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'qa_track_order_mobile_390.png'), fullPage: true });
  console.log('Saved qa_track_order_mobile_390.png');

  // Test 4: Mobile Drawer Menu to confirm FAQ is removed
  console.log('Testing Mobile Drawer Menu on PDP...');
  await page.goto('https://trymalora.com/products/full-spine-ultra-overnight', { waitUntil: 'networkidle2', timeout: 30000 });
  const toggleBtn = await page.$('.uo-mobile-menu-toggle');
  if (toggleBtn) {
    await toggleBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'qa_mobile_drawer_no_faq.png') });
    console.log('Saved qa_mobile_drawer_no_faq.png');
  }

  // Check navigation links present
  const navLinks = await page.$$eval('.uo-mobile-nav a', els => els.map(e => ({ text: e.innerText.trim(), href: e.href })));
  console.log('Mobile nav links on live site:', navLinks);

  await browser.close();
  console.log('Verification finished successfully!');
}

verifyPages().catch(err => {
  console.error('Puppeteer QA Error:', err);
  process.exit(1);
});

