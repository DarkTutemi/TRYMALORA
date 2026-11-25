const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551';

async function runQA() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9297',
    '--window-size=1280,1050',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

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

      async function evaluate(exp) {
        const r = await send('Runtime.evaluate', { expression: exp, returnByValue: true });
        return r.result?.value;
      }

      async function screenshot(name) {
        const r = await send('Page.captureScreenshot', { format: 'png' });
        const buf = Buffer.from(r.result.data, 'base64');
        const p1 = path.join(ARTIFACT_DIR, name);
        fs.writeFileSync(p1, buf);
        console.log(`  [SCREENSHOT SAVED] ${p1}`);
      }

      await send('Emulation.setDeviceMetricsOverride', {
        width: 1280, height: 1050, deviceScaleFactor: 1, mobile: false
      });

      // 1. Bundle Collection
      console.log('>>> TEST 1: /collections/bundle <<<');
      await send('Page.navigate', { url: 'https://trymalora.com/collections/bundle' });
      await new Promise(r => setTimeout(r, 4000));
      const colInfo = await evaluate(`({ h1: document.querySelector('h1')?.innerText, cards: document.querySelectorAll('.malora-card').length })`);
      console.log('Bundle Collection Info:', colInfo);
      await screenshot('qa_malora_bundle_collection.png');

      // 2. Bundle PDP (/products/stretch-mark-bundle)
      console.log('>>> TEST 2: /products/stretch-mark-bundle <<<');
      await send('Page.navigate', { url: 'https://trymalora.com/products/stretch-mark-bundle' });
      await new Promise(r => setTimeout(r, 4000));
      const bundlePdp = await evaluate(`({ h1: document.querySelector('h1')?.innerText, price: document.querySelector('#MaloraPrice')?.innerText })`);
      console.log('Bundle PDP Info:', bundlePdp);
      await screenshot('qa_malora_bundle_pdp.png');

      // 3. Sleepy Lotion PDP + Bundle Upsells
      console.log('>>> TEST 3: /products/sleepylotion <<<');
      await send('Page.navigate', { url: 'https://trymalora.com/products/sleepylotion' });
      await new Promise(r => setTimeout(r, 4000));
      const sleepyPdp = await evaluate(`({ h1: document.querySelector('h1')?.innerText, price: document.querySelector('#MaloraPrice')?.innerText, upsells: document.querySelectorAll('.malora-bundle-item').length })`);
      console.log('Sleepy Lotion PDP Info:', sleepyPdp);
      await screenshot('qa_malora_sleepy_pdp_dynamic.png');

      chrome.kill();
      process.exit(0);
    });
  });
}

runQA().catch(err => {
  console.error('QA Error:', err);
  process.exit(1);
});
