const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-pages';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9288',
    '--window-size=1440,1200',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  http.get('http://127.0.0.1:9288/json', res => {
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

      // Helper for navigation and wait
      async function navigate(url, waitMs = 3000) {
        await send('Page.navigate', { url });
        await new Promise(r => setTimeout(r, waitMs));
      }

      // Helper for viewport
      async function setViewport(width, height, isMobile = false) {
        await send('Emulation.setDeviceMetricsOverride', {
          width,
          height,
          deviceScaleFactor: 2,
          mobile: isMobile
        });
        await new Promise(r => setTimeout(r, 500));
      }

      // 1. About Us Desktop
      console.log('Capturing About Us Desktop...');
      await setViewport(1440, 1000, false);
      await navigate('https://trymalora.com/pages/about-us');
      const shotAboutDesk = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_about_us_desktop.png'), Buffer.from(shotAboutDesk.result.data, 'base64'));
      console.log('Saved qa_about_us_desktop.png');

      // 2. About Us Mobile
      console.log('Capturing About Us Mobile...');
      await setViewport(390, 844, true);
      await new Promise(r => setTimeout(r, 800));
      const shotAboutMob = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_about_us_mobile.png'), Buffer.from(shotAboutMob.result.data, 'base64'));
      console.log('Saved qa_about_us_mobile.png');

      // 3. Track Order Desktop
      console.log('Capturing Track Order Desktop...');
      await setViewport(1440, 1000, false);
      await navigate('https://trymalora.com/pages/track-order');
      const shotTrackDesk = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_track_order_desktop.png'), Buffer.from(shotTrackDesk.result.data, 'base64'));
      console.log('Saved qa_track_order_desktop.png');

      // 4. Track Order Mobile
      console.log('Capturing Track Order Mobile...');
      await setViewport(390, 844, true);
      await new Promise(r => setTimeout(r, 800));
      const shotTrackMob = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_track_order_mobile.png'), Buffer.from(shotTrackMob.result.data, 'base64'));
      console.log('Saved qa_track_order_mobile.png');

      // 5. Mobile Drawer Menu (Confirm FAQ is removed)
      console.log('Capturing Mobile Drawer on PDP...');
      await navigate('https://trymalora.com/products/full-spine-ultra-overnight');
      await send('Runtime.evaluate', {
        expression: `
          const btn = document.querySelector('.uo-mobile-menu-toggle');
          if (btn) btn.click();
        `
      });
      await new Promise(r => setTimeout(r, 800));
      const shotDrawer = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_mobile_drawer_no_faq.png'), Buffer.from(shotDrawer.result.data, 'base64'));
      console.log('Saved qa_mobile_drawer_no_faq.png');

      // Check drawer links evaluation
      const navLinksEval = await send('Runtime.evaluate', {
        expression: `
          Array.from(document.querySelectorAll('.uo-mobile-nav a')).map(a => a.textContent.trim())
        `,
        returnByValue: true
      });
      console.log('Live Mobile Nav Links:', navLinksEval.result?.value);

      ws.close();
      chrome.kill();
      console.log('All QA Captures Completed!');
    });
  });
}

main().catch(console.error);
