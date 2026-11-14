const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-v3-cleanup';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9292',
    '--window-size=1440,1200',
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

      async function navigate(url, waitMs = 3500) {
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
        await new Promise(r => setTimeout(r, 500));
      }

      // 1. PDP Top & Buy Box Desktop
      console.log('Capturing PDP Buy Box Desktop...');
      await setViewport(1440, 1000, false);
      await navigate('https://trymalora.com/products/full-spine-ultra-overnight');
      const shotPdpDesk = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_pdp_buybox_clean_desktop.png'), Buffer.from(shotPdpDesk.result.data, 'base64'));
      console.log('Saved qa_pdp_buybox_clean_desktop.png');

      // 2. PDP FAQ section (Scroll down to FAQ)
      console.log('Capturing PDP FAQ...');
      await send('Runtime.evaluate', {
        expression: `
          const faq = document.querySelector('.uo-faq-section');
          if (faq) faq.scrollIntoView({ behavior: 'instant', block: 'start' });
        `
      });
      await new Promise(r => setTimeout(r, 800));
      const shotFaq = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_pdp_faq_cleaned.png'), Buffer.from(shotFaq.result.data, 'base64'));
      console.log('Saved qa_pdp_faq_cleaned.png');

      // 3. Footer (Scroll to footer)
      console.log('Capturing Footer...');
      await send('Runtime.evaluate', {
        expression: `
          const footer = document.querySelector('.uo-footer');
          if (footer) footer.scrollIntoView({ behavior: 'instant', block: 'start' });
        `
      });
      await new Promise(r => setTimeout(r, 800));
      const shotFooter = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_footer_no_faq.png'), Buffer.from(shotFooter.result.data, 'base64'));
      console.log('Saved qa_footer_no_faq.png');

      // 4. Mobile PDP (390px)
      console.log('Capturing Mobile PDP Buy Box (390px)...');
      await setViewport(390, 844, true);
      await send('Runtime.evaluate', {
        expression: `window.scrollTo(0, 0);`
      });
      await new Promise(r => setTimeout(r, 800));
      const shotMob = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_pdp_mobile_buybox_clean.png'), Buffer.from(shotMob.result.data, 'base64'));
      console.log('Saved qa_pdp_mobile_buybox_clean.png');

      ws.close();
      chrome.kill();
      console.log('All QA captures completed!');
    });
  });
}

main().catch(console.error);
