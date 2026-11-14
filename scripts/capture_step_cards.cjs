const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9277',
    '--window-size=1440,1200',
    'https://ikwh1h-fx.myshopify.com/products/tile-refinishing-paint-restoration-kit?preview_theme_id=197144805747'
  ]);

  await new Promise(r => setTimeout(r, 3000));

  http.get('http://127.0.0.1:9277/json', res => {
    let raw = ''; res.on('data', c => raw += c);
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
            if (d.id === reqId) { ws.removeEventListener('message', h); r(d); }
          };
          ws.addEventListener('message', h);
          ws.send(JSON.stringify({ id: reqId, method: m, params: p }));
        });
      }

      await send('Page.enable');
      await send('Runtime.enable');

      // Dismiss cookie modal and preview bar continuously
      const dismissOverlays = `
        (() => {
          const b = document.getElementById('preview-bar-iframe');
          if (b) b.remove();
          const banners = document.querySelectorAll('iframe, div[class*="cookie"], div[class*="policy"], div[class*="banner"], [aria-label*="Cookie"]');
          banners.forEach(el => {
            if (el.innerText && (el.innerText.includes('Cookie') || el.innerText.includes('Accept'))) {
              el.remove();
            }
          });
          const btns = Array.from(document.querySelectorAll('button'));
          const accept = btns.find(b => b.innerText && b.innerText.trim() === 'Accept');
          if (accept) accept.click();
        })()
      `;

      await send('Runtime.evaluate', { expression: dismissOverlays });
      await new Promise(r => setTimeout(r, 1000));
      await send('Runtime.evaluate', { expression: dismissOverlays });

      // 1. Desktop: Scroll directly to .tm-setup-band
      await send('Runtime.evaluate', {
        expression: `
          const el = document.querySelector('.tm-setup-band');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
        `
      });
      await new Promise(r => setTimeout(r, 1000));
      await send('Runtime.evaluate', { expression: dismissOverlays });

      const shotCards = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_tile_3step_cards_clean.png'), Buffer.from(shotCards.result.data, 'base64'));
      console.log('Saved qa_tile_3step_cards_clean.png');

      // 2. Mobile 390px Buy Box
      await send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });
      await send('Runtime.evaluate', {
        expression: `
          const buyBox = document.querySelector('.zv-bundle-box');
          if (buyBox) buyBox.scrollIntoView({ behavior: 'instant', block: 'start' });
        `
      });
      await new Promise(r => setTimeout(r, 1000));
      await send('Runtime.evaluate', { expression: dismissOverlays });

      const shotMobBuyBox = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_tile_mobile_buybox_clean.png'), Buffer.from(shotMobBuyBox.result.data, 'base64'));
      console.log('Saved qa_tile_mobile_buybox_clean.png');

      // 3. Mobile 390px 3-Step Cards
      await send('Runtime.evaluate', {
        expression: `
          const el = document.querySelector('.tm-setup-band');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        `
      });
      await new Promise(r => setTimeout(r, 1000));
      await send('Runtime.evaluate', { expression: dismissOverlays });

      const shotMobCards = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_tile_mobile_3step_cards.png'), Buffer.from(shotMobCards.result.data, 'base64'));
      console.log('Saved qa_tile_mobile_3step_cards.png');

      chrome.kill();
      process.exit(0);
    });
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

