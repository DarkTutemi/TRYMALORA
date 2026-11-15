const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-pdp-v5-cart';

async function main() {
  console.log('--- Launching Chrome for Final Cart Drawer & Checkout CRO Verification ---');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9294',
    '--window-size=390,844',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  http.get('http://127.0.0.1:9294/json', res => {
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

      await send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });

      console.log('1. Navigating to PDP...');
      await send('Page.navigate', { url: 'https://trymalora.com/products/full-spine-ultra-overnight' });
      await new Promise(r => setTimeout(r, 4500));

      // Clear cart first and wait
      console.log('2. Clearing cart...');
      await send('Runtime.evaluate', {
        expression: `
          (async function() {
            await fetch('/cart/clear.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
          })()
        `,
        awaitPromise: true
      });
      await new Promise(r => setTimeout(r, 1500));

      // Select 5-Pack ($159.96)
      console.log('3. Selecting 5-Pack (Cycle Pack)...');
      await send('Runtime.evaluate', {
        expression: `
          const card5 = document.querySelector('.uo-tier-card[data-tier="5-pairs"]');
          if (card5) card5.click();
        `
      });
      await new Promise(r => setTimeout(r, 600));

      // Click Add to Bag
      console.log('4. Clicking ADD TO BAG...');
      await send('Runtime.evaluate', {
        expression: `
          const btn = document.querySelector('.uo-pdp-atc-btn');
          if (btn) btn.click();
        `
      });
      await new Promise(r => setTimeout(r, 3000));

      // Capture Cart Drawer with 5-pack
      const shotCart5 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_v7_cart_drawer_5pack_clean.png'), Buffer.from(shotCart5.result.data, 'base64'));
      console.log('Saved qa_v7_cart_drawer_5pack_clean.png');

      // Add Wash Bag Upsell
      console.log('5. Clicking + Add to Bag on Wash Bag Upsell...');
      await send('Runtime.evaluate', {
        expression: `
          const upsellBtn = document.querySelector('.willa-upsell-add-btn');
          if (upsellBtn) upsellBtn.click();
        `
      });
      await new Promise(r => setTimeout(r, 3500));

      // Capture Cart Drawer with Upsell added
      const shotCartUpsell = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_v7_cart_drawer_with_wash_bag_clean.png'), Buffer.from(shotCartUpsell.result.data, 'base64'));
      console.log('Saved qa_v7_cart_drawer_with_wash_bag_clean.png');

      // Click Proceed to Secure Checkout
      console.log('6. Navigating to Checkout...');
      await send('Page.navigate', { url: 'https://trymalora.com/checkout' });
      await new Promise(r => setTimeout(r, 6500));

      // Expand Order Summary dropdown on checkout
      console.log('7. Expanding Order Summary dropdown at Checkout...');
      await send('Runtime.evaluate', {
        expression: `
          // Look for Order summary toggle button on mobile
          const summaryBtn = Array.from(document.querySelectorAll('button, [role="button"]')).find(b => {
            const txt = (b.innerText || b.textContent || '').toLowerCase();
            return txt.includes('order summary') || txt.includes('tóm tắt đơn hàng');
          });
          if (summaryBtn) {
            summaryBtn.click();
          } else {
            console.log('Could not find order summary button');
          }
        `
      });
      await new Promise(r => setTimeout(r, 2000));

      // Capture Checkout page with expanded summary
      const shotCheckout = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_v7_checkout_summary_clean.png'), Buffer.from(shotCheckout.result.data, 'base64'));
      console.log('Saved qa_v7_checkout_summary_clean.png');

      ws.close();
      chrome.kill();
      console.log('--- All V5 QA Captures Finished Successfully! ---');
    });
  });
}

main().catch(console.error);
