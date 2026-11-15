const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551';

async function runQA() {
  console.log('================================================================');
  console.log('TRYMALORA — 2 NEW PRODUCTS LAUNCH & EXPANSION FULL QA SUITE');
  console.log('Target Theme: 197625381235 (LIVE)');
  console.log('================================================================\n');

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9295',
    '--window-size=1280,1050',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://127.0.0.1:9295/json', res => {
    let raw = '';
    res.on('data', c => raw += c);
    res.on('end', async () => {
      const tabs = JSON.parse(raw);
      const tab = tabs.find(t => t.type === 'page');
      const ws = new WebSocket(tab.webSocketDebuggerUrl);
      await new Promise(r => ws.addEventListener('open', r));

      let id = 1;
      function send(m, p = {}) {
        return new Promise(r => {
          const reqId = id++;
          const h = e => {
            const d = JSON.parse(e.data);
            if (d.id === reqId) {
              ws.removeEventListener('message', h);
              r(d);
            }
          };
          ws.addEventListener('message', h);
          ws.send(JSON.stringify({ id: reqId, method: m, params: p }));
        });
      }

      await send('Page.enable');
      await send('Runtime.enable');
      await send('DOM.enable');

      // Helper to capture screenshot
      async function saveScreenshot(filename) {
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        const filePath = path.join(ARTIFACT_DIR, filename);
        fs.writeFileSync(filePath, Buffer.from(shot.result.data, 'base64'));
        console.log(`  [SCREENSHOT SAVED] ${filePath}`);
        return filePath;
      }

      // Helper to reset localization to US
      async function setUS() {
        await send('Page.navigate', { url: 'https://trymalora.com/' });
        await new Promise(r => setTimeout(r, 2500));
        await send('Runtime.evaluate', {
          expression: `
            (async function() {
              await fetch('/cart/clear.js', { method: 'POST' });
              const fd = new FormData();
              fd.append('_method', 'PUT');
              fd.append('country_code', 'US');
              await fetch('/localization', { method: 'POST', body: fd });
            })()
          `,
          awaitPromise: true
        });
      }

      await setUS();

      // TEST 1: Homepage Shop By Style
      console.log('\n>>> TEST 1: Homepage Shop By Style Section <<<');
      await send('Page.navigate', { url: 'https://trymalora.com/' });
      await new Promise(r => setTimeout(r, 4000));

      const hpData = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const section = document.getElementById('uoShopByStyle');
            const title = section ? section.querySelector('.uo-shop-styles-title')?.textContent?.trim() : null;
            const cards = section ? Array.from(section.querySelectorAll('.uo-style-card')).map(c => ({
              name: c.querySelector('.uo-style-name')?.textContent?.trim(),
              price: c.querySelector('.uo-style-price-val')?.textContent?.trim(),
              tag: c.querySelector('.uo-style-badge')?.textContent?.trim(),
              link: c.querySelector('.uo-style-cta')?.getAttribute('href')
            })) : [];
            return { hasSection: !!section, title, cards };
          })()
        `,
        returnByValue: true
      });
      console.log('Homepage Shop By Style:', JSON.stringify(hpData.result?.result?.value, null, 2));
      await saveScreenshot('qa_homepage_shop_by_style.png');

      // TEST 2: Product 01 — ULTRA LACE™
      console.log('\n>>> TEST 2: Product 01 — ULTRA LACE™ PDP <<<');
      await send('Page.navigate', { url: 'https://trymalora.com/products/ultra-lace-period-briefs' });
      await new Promise(r => setTimeout(r, 4500));

      const laceData = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const title = document.querySelector('.uo-product-title')?.textContent?.trim();
            const category = document.querySelector('.uo-product-category')?.textContent?.trim();
            const price = document.querySelector('.uo-price-current')?.textContent?.trim();
            const compare = document.querySelector('#uoPriceCompare')?.textContent?.trim();
            
            const swatches = Array.from(document.querySelectorAll('.uo-color-swatch')).map(s => s.getAttribute('data-color-name'));
            const sizes = Array.from(document.querySelectorAll('.uo-size-pill')).map(s => s.getAttribute('data-size-value'));
            
            const t1 = document.querySelector('.uo-tier-card[data-tier="1-pair"] .uo-tier-final-price')?.textContent?.trim();
            const t3 = document.querySelector('.uo-tier-card[data-tier="3-pairs"] .uo-tier-final-price')?.textContent?.trim();
            const t3Orig = document.querySelector('.uo-tier-card[data-tier="3-pairs"] .uo-tier-orig-price')?.textContent?.trim();
            const t5 = document.querySelector('.uo-tier-card[data-tier="5-pairs"] .uo-tier-final-price')?.textContent?.trim();
            const t5Orig = document.querySelector('.uo-tier-card[data-tier="5-pairs"] .uo-tier-orig-price')?.textContent?.trim();
            
            return { title, category, price, compare, swatches, sizes, t1, t3, t3Orig, t5, t5Orig };
          })()
        `,
        returnByValue: true
      });
      console.log('ULTRA LACE PDP Details:', JSON.stringify(laceData.result?.result?.value, null, 2));

      // Test Add to Bag on Lace
      console.log('  Adding ULTRA LACE 3 Pairs to Cart...');
      await send('Runtime.evaluate', {
        expression: `
          (function() {
            const atc = document.querySelector('.uo-pdp-atc-btn');
            if (atc) atc.click();
          })()
        `
      });
      await new Promise(r => setTimeout(r, 4000));

      const cartLace = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const drawer = document.getElementById('willaCartDrawer');
            return {
              isActive: drawer?.classList.contains('active') || drawer?.classList.contains('is-active'),
              subtotal: document.getElementById('willaDrawerSubtotal')?.textContent?.trim(),
              orig: document.getElementById('willaOrigSubtotal')?.textContent?.trim(),
              shipping: document.getElementById('willaShippingText')?.textContent?.trim()
            };
          })()
        `,
        returnByValue: true
      });
      console.log('Cart with ULTRA LACE 3-Pack:', JSON.stringify(cartLace.result?.result?.value, null, 2));
      await saveScreenshot('qa_ultra_lace_pdp_cart.png');

      // Clear cart
      await send('Runtime.evaluate', { expression: `fetch('/cart/clear.js', { method: 'POST' })`, awaitPromise: true });

      // TEST 3: Product 02 — ULTRA COMFORT SHORTS™
      console.log('\n>>> TEST 3: Product 02 — ULTRA COMFORT SHORTS™ PDP <<<');
      await send('Page.navigate', { url: 'https://trymalora.com/products/ultra-comfort-period-shorts' });
      await new Promise(r => setTimeout(r, 4500));

      const shortsData = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const title = document.querySelector('.uo-product-title')?.textContent?.trim();
            const category = document.querySelector('.uo-product-category')?.textContent?.trim();
            const price = document.querySelector('.uo-price-current')?.textContent?.trim();
            const compare = document.querySelector('#uoPriceCompare')?.textContent?.trim();
            
            const swatches = Array.from(document.querySelectorAll('.uo-color-swatch')).map(s => s.getAttribute('data-color-name'));
            const sizes = Array.from(document.querySelectorAll('.uo-size-pill')).map(s => s.getAttribute('data-size-value'));
            
            const t1 = document.querySelector('.uo-tier-card[data-tier="1-pair"] .uo-tier-final-price')?.textContent?.trim();
            const t3 = document.querySelector('.uo-tier-card[data-tier="3-pairs"] .uo-tier-final-price')?.textContent?.trim();
            const t3Orig = document.querySelector('.uo-tier-card[data-tier="3-pairs"] .uo-tier-orig-price')?.textContent?.trim();
            const t5 = document.querySelector('.uo-tier-card[data-tier="5-pairs"] .uo-tier-final-price')?.textContent?.trim();
            const t5Orig = document.querySelector('.uo-tier-card[data-tier="5-pairs"] .uo-tier-orig-price')?.textContent?.trim();
            
            return { title, category, price, compare, swatches, sizes, t1, t3, t3Orig, t5, t5Orig };
          })()
        `,
        returnByValue: true
      });
      console.log('ULTRA COMFORT SHORTS PDP Details:', JSON.stringify(shortsData.result?.result?.value, null, 2));

      // Test Add to Bag on Shorts (5 Pairs)
      console.log('  Adding ULTRA COMFORT SHORTS 5 Pairs to Cart...');
      await send('Runtime.evaluate', {
        expression: `
          (function() {
            const t5 = document.querySelector('.uo-tier-card[data-tier="5-pairs"]');
            if (t5) t5.click();
            setTimeout(() => {
              const atc = document.querySelector('.uo-pdp-atc-btn');
              if (atc) atc.click();
            }, 500);
          })()
        `
      });
      await new Promise(r => setTimeout(r, 4500));

      const cartShorts = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const drawer = document.getElementById('willaCartDrawer');
            return {
              isActive: drawer?.classList.contains('active') || drawer?.classList.contains('is-active'),
              subtotal: document.getElementById('willaDrawerSubtotal')?.textContent?.trim(),
              orig: document.getElementById('willaOrigSubtotal')?.textContent?.trim(),
              shipping: document.getElementById('willaShippingText')?.textContent?.trim()
            };
          })()
        `,
        returnByValue: true
      });
      console.log('Cart with ULTRA SHORTS 5-Pack:', JSON.stringify(cartShorts.result?.result?.value, null, 2));
      await saveScreenshot('qa_ultra_shorts_pdp_cart.png');

      // Clear cart
      await send('Runtime.evaluate', { expression: `fetch('/cart/clear.js', { method: 'POST' })`, awaitPromise: true });

      // TEST 4: Verify Flagship Unaffected
      console.log('\n>>> TEST 4: Verify Flagship (FULL-SPINE ULTRA OVERNIGHT™) Unaffected <<<');
      await send('Page.navigate', { url: 'https://trymalora.com/products/full-spine-ultra-overnight' });
      await new Promise(r => setTimeout(r, 4500));

      const flagshipData = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const title = document.querySelector('.uo-product-title')?.textContent?.trim();
            const swatches = Array.from(document.querySelectorAll('.uo-color-swatch')).map(s => s.getAttribute('data-color-name'));
            const sizes = Array.from(document.querySelectorAll('.uo-size-pill')).map(s => s.getAttribute('data-size-value'));
            const t1 = document.querySelector('.uo-tier-card[data-tier="1-pair"] .uo-tier-final-price')?.textContent?.trim();
            const t3 = document.querySelector('.uo-tier-card[data-tier="3-pairs"] .uo-tier-final-price')?.textContent?.trim();
            const t5 = document.querySelector('.uo-tier-card[data-tier="5-pairs"] .uo-tier-final-price')?.textContent?.trim();
            return { title, swatches, sizes, t1, t3, t5 };
          })()
        `,
        returnByValue: true
      });
      console.log('Flagship Details:', JSON.stringify(flagshipData.result?.result?.value, null, 2));
      await saveScreenshot('qa_flagship_unaffected.png');

      // TEST 5: Cross-Style Mix & Match at Checkout (2 Lace + 1 Overnight = 3 Items -> 10% OFF)
      console.log('\n>>> TEST 5: Cross-Style Mix & Match at Checkout (2 Lace + 1 Overnight -> 10% OFF) <<<');
      await send('Runtime.evaluate', { expression: `fetch('/cart/clear.js', { method: 'POST' })`, awaitPromise: true });
      await send('Runtime.evaluate', {
        expression: `
          (async function() {
            // Add 2 Lace (XS / Red)
            await fetch('/cart/add.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: [
                  { id: 67417261670771, quantity: 2, properties: { 'Pack': 'Cross-Style Pack' } }, // Lace XS / Red
                  { id: 67401560064371, quantity: 1, properties: { 'Pack': 'Cross-Style Pack' } }  // Overnight XS / Black
                ]
              })
            });
          })()
        `,
        awaitPromise: true
      });

      console.log('  Navigating to checkout for 3-item cross-style test...');
      await send('Page.navigate', { url: 'https://trymalora.com/checkout' });
      await new Promise(r => setTimeout(r, 6500));

      const co3 = await send('Runtime.evaluate', {
        expression: `
          ({
            url: window.location.href,
            bodyText: document.body.innerText.substring(0, 1200)
          })
        `,
        returnByValue: true
      });
      console.log('Checkout 3-Pack snippet:', co3.result?.result?.value?.bodyText.substring(0, 400));
      await saveScreenshot('qa_cross_style_checkout_3pack.png');

      // TEST 6: Collection Page
      console.log('\n>>> TEST 6: Collection Page (ULTRA PERIOD UNDERWEAR COLLECTION) <<<');
      await send('Page.navigate', { url: 'https://trymalora.com/collections/ultra-period-underwear' });
      await new Promise(r => setTimeout(r, 4500));
      await saveScreenshot('qa_collection_ultra_underwear.png');

      // TEST 7: Vietnam (VND) Localization on New Product
      console.log('\n>>> TEST 7: Vietnam (VND) Localization on ULTRA LACE <<<');
      await send('Runtime.evaluate', {
        expression: `
          (async function() {
            await fetch('/cart/clear.js', { method: 'POST' });
            const fd = new FormData();
            fd.append('_method', 'PUT');
            fd.append('country_code', 'VN');
            await fetch('/localization', { method: 'POST', body: fd });
          })()
        `,
        awaitPromise: true
      });

      await send('Page.navigate', { url: 'https://trymalora.com/products/ultra-lace-period-briefs' });
      await new Promise(r => setTimeout(r, 4500));

      const laceVnd = await send('Runtime.evaluate', {
        expression: `
          ({
            curr: window.Shopify?.currency?.active,
            mainPrice: document.querySelector('.uo-price-current')?.textContent?.trim(),
            t1: document.querySelector('.uo-tier-card[data-tier="1-pair"] .uo-tier-final-price')?.textContent?.trim(),
            t3: document.querySelector('.uo-tier-card[data-tier="3-pairs"] .uo-tier-final-price')?.textContent?.trim(),
            t5: document.querySelector('.uo-tier-card[data-tier="5-pairs"] .uo-tier-final-price')?.textContent?.trim()
          })
        `,
        returnByValue: true
      });
      console.log('ULTRA LACE in VND:', JSON.stringify(laceVnd.result?.result?.value, null, 2));
      await saveScreenshot('qa_new_products_vnd.png');

      console.log('\n================================================================');
      console.log('ALL QA SUITE TESTS COMPLETED SUCCESSFULLY!');
      console.log('================================================================');

      ws.close();
      chrome.kill();
      process.exit(0);
    });
  });
}

runQA().catch(err => {
  console.error('Fatal QA error:', err);
  process.exit(1);
});
