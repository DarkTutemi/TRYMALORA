const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-pdp-v4-cart';

async function main() {
  console.log('--- Launching Chrome for New Cart & Checkout V4 QA ---');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9292',
    '--window-size=390,844',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  http.get('http://127.0.0.1:9292/json', res => {
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

      // Clear cart
      await send('Runtime.evaluate', { expression: `fetch('/cart/clear.js', { method: 'POST' });` });
      await new Promise(r => setTimeout(r, 1000));

      // Select 5-pack tier (Cycle Pack, $159.96)
      console.log('2. Selecting 5-Pack and clicking ADD TO BAG...');
      await send('Runtime.evaluate', {
        expression: `
          const card5 = document.querySelector('.uo-tier-card[data-tier="5-pairs"]');
          if (card5) card5.click();
        `
      });
      await new Promise(r => setTimeout(r, 600));

      // Click ADD TO BAG
      await send('Runtime.evaluate', {
        expression: `
          const btn = document.querySelector('.uo-pdp-atc-btn');
          if (btn) btn.click();
        `
      });
      await new Promise(r => setTimeout(r, 2500));

      // Capture New Cart Drawer (5-pack)
      const shotCart5 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_live_v4_new_cart_drawer_5pack.png'), Buffer.from(shotCart5.result.data, 'base64'));
      console.log('Saved qa_live_v4_new_cart_drawer_5pack.png');

      // Add Upsell Wash Bag
      console.log('3. Clicking + Add to Bag on Delicate Wash Bag upsell...');
      await send('Runtime.evaluate', {
        expression: `
          const upsellBtn = document.querySelector('.willa-upsell-add-btn');
          if (upsellBtn) upsellBtn.click();
        `
      });
      await new Promise(r => setTimeout(r, 2500));

      const shotCartUpsell = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_live_v4_cart_with_upsell.png'), Buffer.from(shotCartUpsell.result.data, 'base64'));
      console.log('Saved qa_live_v4_cart_with_upsell.png');

      // Click Checkout
      console.log('4. Navigating to Checkout...');
      await send('Page.navigate', { url: 'https://trymalora.com/checkout' });
      await new Promise(r => setTimeout(r, 6000));

      const shotCheckout = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_live_v4_checkout_with_brand_and_clean_summary.png'), Buffer.from(shotCheckout.result.data, 'base64'));
      console.log('Saved qa_live_v4_checkout_with_brand_and_clean_summary.png');

      ws.close();
      chrome.kill();
      console.log('--- All V4 Captures Completed! ---');
    });
  });
}

main().catch(console.error);
