const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-pdp-v3-sections';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9293',
    '--window-size=1440,1200',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  http.get('http://127.0.0.1:9293/json', res => {
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

      async function navigate(url, waitMs = 4000) {
        await send('Page.navigate', { url });
        await new Promise(r => setTimeout(r, waitMs));
      }

      async function setViewport(width, height, isMobile = false) {
        await send('Emulation.setDeviceMetricsOverride', {
          width,
          height,
          deviceScaleFactor: 2,
          mobile: isMobile
        });
        await new Promise(r => setTimeout(r, 600));
      }

      async function captureSection(selector, filename) {
        await send('Runtime.evaluate', {
          expression: `
            const el = document.querySelector('${selector}');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
          `
        });
        await new Promise(r => setTimeout(r, 1000));
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACT_DIR, filename), Buffer.from(shot.result.data, 'base64'));
        console.log(`Saved ${filename}`);
      }

      console.log('Loading live PDP on desktop...');
      await setViewport(1440, 1000, false);
      await navigate('https://trymalora.com/products/full-spine-ultra-overnight');

      // 1. Desktop Gallery & Buybox
      await captureSection('.uo-gallery-wrap', 'qa_live_v3_gallery_desktop.png');

      // 2. Editorial Section
      await captureSection('.uo-pdp-editorial', 'qa_live_v3_editorial.png');

      // 3. 5 Layers Section
      await captureSection('.uo-layers-section', 'qa_live_v3_layers.png');

      // 4. Comfort Section (Every Way You Sleep)
      await captureSection('.uo-comfort-section', 'qa_live_v3_comfort.png');

      // 5. Fabric Section (Skin to Skin Softness)
      await captureSection('.uo-fabric-section', 'qa_live_v3_fabric.png');

      // 6. Tabs Section (Technical Specs with Image)
      await captureSection('.uo-details-section', 'qa_live_v3_tabs_specs.png');

      // 7. Final Reminder / Closing Card
      await captureSection('.uo-final-cta-card', 'qa_live_v3_closing_cta.png');

      // 8. Mobile Gallery (390px)
      console.log('Switching to Mobile 390px...');
      await setViewport(390, 844, true);
      await send('Runtime.evaluate', { expression: `window.scrollTo(0, 0);` });
      await new Promise(r => setTimeout(r, 1000));
      const shotMob = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_live_v3_gallery_mobile.png'), Buffer.from(shotMob.result.data, 'base64'));
      console.log('Saved qa_live_v3_gallery_mobile.png');

      ws.close();
      chrome.kill();
      console.log('All QA captures successfully finished!');
    });
  });
}

main().catch(console.error);

