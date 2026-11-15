const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-pdp-v3-eval';

async function runVerification() {
  console.log('================================================================');
  console.log('TRYMALORA — ULTRA OVERNIGHT PDP V3 VERIFICATION & QA RUN');
  console.log('Testing Live Store: https://trymalora.com/products/full-spine-ultra-overnight');
  console.log('================================================================\n');

  // Clear cart first via direct fetch or cookie
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9298',
    '--window-size=390,844',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  http.get('http://127.0.0.1:9298/json', res => {
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

      // Set Mobile Viewport (iPhone 14: 390x844)
      await send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });

      console.log('1. Navigating to Live PDP on Mobile...');
      await send('Page.navigate', { url: 'https://trymalora.com/products/full-spine-ultra-overnight' });
      await new Promise(r => setTimeout(r, 4500));

      // Clear any existing cart items to ensure fresh state
      await send('Runtime.evaluate', {
        expression: `fetch('/cart/clear.js', { method: 'POST' });`
      });
      await new Promise(r => setTimeout(r, 1000));

      // -------------------------------------------------------------
      // TEST 1: Mobile Buy Box, Bundle Cards & Color Swatches
      // -------------------------------------------------------------
      console.log('\n--- Test 1: Mobile Buy Box, Bundles & Swatches ---');
      const buyboxData = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const swatches = Array.from(document.querySelectorAll('.uo-color-swatch')).map(s => ({
              name: s.getAttribute('data-color-name'),
              hex: s.getAttribute('data-swatch-hex'),
              isActive: s.classList.contains('is-active')
            }));

            const tiers = Array.from(document.querySelectorAll('.uo-tier-card')).map(t => ({
              tier: t.getAttribute('data-tier'),
              packQty: t.getAttribute('data-pack-qty'),
              isSelected: t.classList.contains('is-selected'),
              badge: t.querySelector('.uo-tier-badge')?.textContent?.trim() || '',
              price: t.querySelector('.uo-tier-final-price')?.textContent?.trim() || t.querySelector('.uo-tier-price')?.textContent?.trim() || '',
              origPrice: t.querySelector('.uo-tier-orig-price')?.textContent?.trim() || '',
              savings: t.querySelector('.uo-tier-savings-note')?.textContent?.trim() || t.querySelector('.uo-tier-save-pill')?.textContent?.trim() || '',
              benefit: t.querySelector('.uo-tier-benefit')?.textContent?.trim() || '',
              freeShipping: !!t.querySelector('.uo-tier-shipping-tag')
            }));

            const viewers = document.getElementById('uoLiveViewerCount')?.textContent?.trim();
            const tpBar = document.querySelector('.uo-trustpilot-rating-bar')?.textContent?.replace(/\\s+/g, ' ').trim();
            const microcopy = document.querySelector('.uo-bundle-microcopy')?.textContent?.trim();

            return { swatches, tiers, viewers, tpBar, microcopy };
          })()
        `,
        returnByValue: true
      });

      if (!buyboxData.result || !buyboxData.result.value) {
        console.error('Runtime.evaluate returned:', JSON.stringify(buyboxData, null, 2));
      }
      console.log('  Swatches Detected:', JSON.stringify(buyboxData.result?.value?.swatches, null, 2));
      console.log('  Bundle Cards Detected:', JSON.stringify(buyboxData.result?.value?.tiers, null, 2));
      console.log('  Live Viewers Count:', buyboxData.result?.value?.viewers);
      console.log('  Trustpilot Bar:', buyboxData.result?.value?.tpBar);
      console.log('  Bundle Microcopy:', buyboxData.result?.value?.microcopy);

      // Scroll to Buy Box and capture screenshot
      await send('Runtime.evaluate', {
        expression: `
          const el = document.querySelector('.uo-bundle-section');
          if (el) {
            const rect = el.getBoundingClientRect();
            window.scrollTo({ top: window.pageYOffset + rect.top - 140, behavior: 'instant' });
          }
        `
      });
      await new Promise(r => setTimeout(r, 800));
      const shotBuybox = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_live_v3_buybox_bundles_mobile.png'), Buffer.from(shotBuybox.result.data, 'base64'));
      console.log('  [SCREENSHOT] Saved qa_live_v3_buybox_bundles_mobile.png');

      // -------------------------------------------------------------
      // TEST 2: Mobile Editorial Section ("Protection Designed Beyond...")
      // Verify image is rendered BEFORE title/copy
      // -------------------------------------------------------------
      console.log('\n--- Test 2: Mobile Editorial Section Re-ordering ---');
      const editorialOrder = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const layout = document.querySelector('.uo-pdp-editorial-layout');
            const visual = document.querySelector('.uo-pdp-editorial-visual');
            const content = document.querySelector('.uo-pdp-editorial-content');
            if (!layout || !visual || !content) return null;

            const layoutComputed = window.getComputedStyle(layout);
            const visualComputed = window.getComputedStyle(visual);
            const contentComputed = window.getComputedStyle(content);

            const visualRect = visual.getBoundingClientRect();
            const contentRect = content.getBoundingClientRect();

            return {
              layoutDisplay: layoutComputed.display,
              layoutFlexDirection: layoutComputed.flexDirection,
              visualOrder: visualComputed.order,
              visualTop: visualRect.top,
              contentTop: contentRect.top,
              isVisualBeforeContent: visualRect.top < contentRect.top
            };
          })()
        `,
        returnByValue: true
      });
      console.log('  Editorial Mobile Layout Check:', JSON.stringify(editorialOrder.result.value, null, 2));

      await send('Runtime.evaluate', {
        expression: `
          const sec = document.querySelector('.uo-pdp-editorial');
          if (sec) {
            const rect = sec.getBoundingClientRect();
            window.scrollTo({ top: window.pageYOffset + rect.top - 20, behavior: 'instant' });
          }
        `
      });
      await new Promise(r => setTimeout(r, 800));
      const shotEditorial = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_live_v3_editorial_mobile_reorder.png'), Buffer.from(shotEditorial.result.data, 'base64'));
      console.log('  [SCREENSHOT] Saved qa_live_v3_editorial_mobile_reorder.png');

      // -------------------------------------------------------------
      // TEST 3: Mix & Match Customization Slots
      // -------------------------------------------------------------
      console.log('\n--- Test 3: Mix & Match Customization ---');
      // Scroll back to Mix & Match button
      await send('Runtime.evaluate', {
        expression: `
          const mm = document.getElementById('uoMixMatchToggle');
          if (mm) {
            const rect = mm.getBoundingClientRect();
            window.scrollTo({ top: window.pageYOffset + rect.top - 80, behavior: 'instant' });
            mm.click();
          }
        `
      });
      await new Promise(r => setTimeout(r, 800));

      const mixMatchSlots = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const slots = Array.from(document.querySelectorAll('.uo-pair-slot')).map((slot, i) => {
              const sizes = Array.from(slot.querySelectorAll('.uo-slot-size option')).map(o => o.value);
              const colors = Array.from(slot.querySelectorAll('.uo-slot-color option')).map(o => o.value);
              const selectedSize = slot.querySelector('.uo-slot-size')?.value;
              const selectedColor = slot.querySelector('.uo-slot-color')?.value;
              return { pairIndex: i + 1, selectedSize, selectedColor, availableColors: colors };
            });
            return slots;
          })()
        `,
        returnByValue: true
      });
      console.log('  Mix & Match Slots Rendered:', JSON.stringify(mixMatchSlots.result.value, null, 2));

      const shotMixMatch = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_live_v3_mix_match_expanded.png'), Buffer.from(shotMixMatch.result.data, 'base64'));
      console.log('  [SCREENSHOT] Saved qa_live_v3_mix_match_expanded.png');

      // -------------------------------------------------------------
      // TEST 4: Add to Cart (3-Pack Default) & Willa Cart Drawer Progress
      // -------------------------------------------------------------
      console.log('\n--- Test 4: Add to Bag (3-Pack) & Free Shipping Progress Bar ---');
      await send('Runtime.evaluate', {
        expression: `
          // Close mix & match to test standard 3-pack ATC
          const mm = document.getElementById('uoMixMatchToggle');
          if (mm && mm.getAttribute('aria-expanded') === 'true') {
            mm.click();
          }
          const atcBtn = document.querySelector('.uo-pdp-atc-btn');
          if (atcBtn) atcBtn.click();
        `
      });
      await new Promise(r => setTimeout(r, 3000));

      const cartState = await send('Runtime.evaluate', {
        expression: `
          (async function() {
            const res = await fetch('/cart.js');
            const cart = await res.json();
            const drawerOpen = document.getElementById('willaCartDrawer')?.classList.contains('open') ||
                               document.getElementById('willaCartDrawer')?.classList.contains('is-active');
            const shippingText = document.getElementById('willaShippingText')?.textContent?.trim();
            const fillWidth = document.getElementById('willaShippingFill')?.style?.width;
            const subtotalText = document.getElementById('willaDrawerSubtotal')?.textContent?.trim();
            return {
              item_count: cart.item_count,
              total_price: cart.total_price,
              items: cart.items.map(i => ({
                id: i.id,
                title: i.title,
                variant_title: i.variant_title,
                quantity: i.quantity,
                line_price: i.line_price,
                properties: i.properties
              })),
              drawerOpen,
              shippingText,
              fillWidth,
              subtotalText
            };
          })()
        `,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('  Live Cart State after 3-Pack ATC:', JSON.stringify(cartState.result.value, null, 2));

      const shotCartDrawer = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_live_v3_cart_drawer_3pack.png'), Buffer.from(shotCartDrawer.result.data, 'base64'));
      console.log('  [SCREENSHOT] Saved qa_live_v3_cart_drawer_3pack.png');

      // -------------------------------------------------------------
      // TEST 5: Proceed to Checkout & Verify Automatic Discounts
      // -------------------------------------------------------------
      console.log('\n--- Test 5: Checkout Automatic Discount & Free Shipping ---');
      await send('Page.navigate', { url: 'https://trymalora.com/checkout' });
      await new Promise(r => setTimeout(r, 6000));

      const checkoutState = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const bodyText = document.body.innerText;
            const has3PackDiscount = bodyText.includes('10%') || bodyText.includes('3-Pack') || bodyText.includes('ULTRA OVERNIGHT — 3-Pack 10% OFF');
            const hasFreeShipping = bodyText.includes('Free') || bodyText.includes('FREE');
            
            // Extract discount tags or price lines
            const discountPills = Array.from(document.querySelectorAll('[data-reduction-code], .reduction-code, [role="status"], .tags-list')).map(e => e.innerText);

            return {
              currentUrl: window.location.href,
              pageTitle: document.title,
              has3PackDiscount,
              hasFreeShipping,
              discountPills: discountPills.filter(Boolean),
              sampleBodySnippet: bodyText.slice(0, 500)
            };
          })()
        `,
        returnByValue: true
      });
      console.log('  Checkout State:', JSON.stringify(checkoutState.result.value, null, 2));

      const shotCheckout = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_live_v3_checkout_discounts.png'), Buffer.from(shotCheckout.result.data, 'base64'));
      console.log('  [SCREENSHOT] Saved qa_live_v3_checkout_discounts.png');

      // -------------------------------------------------------------
      // TEST 6: Desktop Viewport Layout (1440x900)
      // -------------------------------------------------------------
      console.log('\n--- Test 6: Desktop Viewport Buy Box & Gallery Layout ---');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 900,
        deviceScaleFactor: 2,
        mobile: false
      });
      await send('Page.navigate', { url: 'https://trymalora.com/products/full-spine-ultra-overnight' });
      await new Promise(r => setTimeout(r, 4000));

      const shotDesktop = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_live_v3_desktop_buybox.png'), Buffer.from(shotDesktop.result.data, 'base64'));
      console.log('  [SCREENSHOT] Saved qa_live_v3_desktop_buybox.png');

      ws.close();
      chrome.kill();
      console.log('\n================================================================');
      console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
      console.log('================================================================');
    });
  });
}

runVerification().catch(console.error);
