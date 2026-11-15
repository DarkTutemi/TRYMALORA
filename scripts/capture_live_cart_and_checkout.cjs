const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-pdp-v3-cart-checkout';

async function main() {
  console.log('--- Launching Chrome for Cart & Checkout Live QA ---');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9297',
    '--window-size=390,844',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  http.get('http://127.0.0.1:9297/json', res => {
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

      await send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });

      console.log('1. Navigating to PDP on mobile...');
      await send('Page.navigate', { url: 'https://trymalora.com/products/full-spine-ultra-overnight' });
      await new Promise(r => setTimeout(r, 4500));

      // Clear cart
      await send('Runtime.evaluate', {
        expression: `fetch('/cart/clear.js', { method: 'POST' });`
      });
      await new Promise(r => setTimeout(r, 1000));

      // -----------------------------------------------------------
      // TEST: Add Default 3-Pack ($107.97, 10% OFF, Free US Shipping)
      // -----------------------------------------------------------
      console.log('2. Clicking ADD TO BAG for 3-Pack...');
      const atcResult = await send('Runtime.evaluate', {
        expression: `
          (async function() {
            const btn = document.querySelector('.uo-pdp-atc-btn');
            if (btn) btn.click();
            await new Promise(r => setTimeout(r, 2500));
            const drawer = document.getElementById('willaCartDrawer');
            return {
              drawerActive: drawer ? drawer.classList.contains('active') : false,
              drawerHtmlSnippet: drawer ? drawer.innerText.slice(0, 300) : ''
            };
          })()
        `,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('Cart Drawer State:', JSON.stringify(atcResult.result?.result?.value, null, 2));

      await new Promise(r => setTimeout(r, 1000));
      const shotDrawer = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_live_v3_cart_drawer_active.png'), Buffer.from(shotDrawer.result.data, 'base64'));
      console.log('Saved qa_live_v3_cart_drawer_active.png');

      // -----------------------------------------------------------
      // TEST: Checkout with 3-Pack
      // -----------------------------------------------------------
      console.log('3. Navigating to Checkout to verify 10% Automatic Discount...');
      await send('Page.navigate', { url: 'https://trymalora.com/checkout' });
      await new Promise(r => setTimeout(r, 7000));

      const checkoutData = await send('Runtime.evaluate', {
        expression: `
          (function() {
            return {
              url: window.location.href,
              title: document.title,
              bodyText: document.body.innerText.slice(0, 1500)
            };
          })()
        `,
        returnByValue: true
      });
      console.log('Checkout URL:', checkoutData.result?.result?.value?.url);
      console.log('Checkout Title:', checkoutData.result?.result?.value?.title);
      console.log('Checkout Body Preview:\n', checkoutData.result?.result?.value?.bodyText);

      const shotCheckout = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_live_v3_checkout_confirmed.png'), Buffer.from(shotCheckout.result.data, 'base64'));
      console.log('Saved qa_live_v3_checkout_confirmed.png');

      ws.close();
      chrome.kill();
      console.log('--- Completed Cart & Checkout QA ---');
    });
  });
}

main().catch(console.error);

