const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-checkout-us';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9296',
    '--window-size=390,920',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  http.get('http://127.0.0.1:9296/json', res => {
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
        height: 920,
        deviceScaleFactor: 2,
        mobile: true
      });

      console.log('1. Navigating to PDP...');
      await send('Page.navigate', { url: 'https://trymalora.com/products/full-spine-ultra-overnight' });
      await new Promise(r => setTimeout(r, 4000));

      // Clear cart and add exactly 3 pairs ($119.97 -> $107.97)
      await send('Runtime.evaluate', {
        expression: `
          (async function() {
            await fetch('/cart/clear.js', { method: 'POST' });
            await fetch('/cart/add.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: [{
                  id: 67401560129907,
                  quantity: 3,
                  properties: { 'Pack': '3 Pairs', 'Brand': 'ULTRA OVERNIGHT™' }
                }]
              })
            });
          })()
        `,
        awaitPromise: true
      });
      await new Promise(r => setTimeout(r, 1000));

      console.log('2. Navigating to Checkout...');
      await send('Page.navigate', { url: 'https://trymalora.com/checkout' });
      await new Promise(r => setTimeout(r, 6000));

      // Expand order summary if collapsed
      await send('Runtime.evaluate', {
        expression: `
          (function() {
            const toggle = Array.from(document.querySelectorAll('button, a, div')).find(el => 
              el.innerText && (el.innerText.includes('Order summary') || el.innerText.includes('Show order summary'))
            );
            if (toggle) toggle.click();
          })()
        `
      });
      await new Promise(r => setTimeout(r, 1500));

      const shotCheckout3 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_live_v3_checkout_expanded_3pack.png'), Buffer.from(shotCheckout3.result.data, 'base64'));
      console.log('Saved qa_live_v3_checkout_expanded_3pack.png');

      ws.close();
      chrome.kill();
    });
  });
}

main().catch(console.error);
