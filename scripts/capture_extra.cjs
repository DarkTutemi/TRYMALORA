const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-pdp-v3-sections3';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9295',
    '--window-size=1440,1200',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

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

      await send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 1000,
        deviceScaleFactor: 2,
        mobile: false
      });

      console.log('Navigating to live PDP...');
      await send('Page.navigate', { url: 'https://trymalora.com/products/full-spine-ultra-overnight' });
      await new Promise(r => setTimeout(r, 4500));

      // Scroll to bottom final cta
      await send('Runtime.evaluate', {
        expression: `
          const card = document.querySelector('.uo-final-cta-card') || document.querySelector('.uo-closing-card');
          if (card) {
            const rect = card.getBoundingClientRect();
            window.scrollTo({ top: window.pageYOffset + rect.top - 80, behavior: 'instant' });
          }
        `
      });
      await new Promise(r => setTimeout(r, 1000));
      const shotFinal = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_sec_final_cta.png'), Buffer.from(shotFinal.result.data, 'base64'));
      console.log('Saved qa_sec_final_cta.png');

      // Check Mobile Tabs Specs (390px)
      await send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });
      await send('Runtime.evaluate', {
        expression: `
          const tabs = document.querySelector('#ultra-product-details');
          if (tabs) {
            const rect = tabs.getBoundingClientRect();
            window.scrollTo({ top: window.pageYOffset + rect.top - 20, behavior: 'instant' });
          }
        `
      });
      await new Promise(r => setTimeout(r, 1000));
      const shotMobTabs = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_sec_mobile_tabs.png'), Buffer.from(shotMobTabs.result.data, 'base64'));
      console.log('Saved qa_sec_mobile_tabs.png');

      ws.close();
      chrome.kill();
      console.log('Completed extra captures!');
    });
  });
}

main().catch(console.error);
