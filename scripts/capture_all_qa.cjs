const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9276',
    '--window-size=1440,1400',
    'https://ikwh1h-fx.myshopify.com/products/tile-refinishing-paint-restoration-kit?preview_theme_id=197144805747'
  ]);

  await new Promise(r => setTimeout(r, 3000));

  http.get('http://127.0.0.1:9276/json', res => {
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

      // Submit password if prompted
      await send('Runtime.evaluate', {
        expression: `
          const pw = document.querySelector('input[type="password"]');
          if (pw) {
            pw.value = ${JSON.stringify(STORE_PASSWORD)};
            pw.closest('form').submit();
          }
        `
      });

      await new Promise(r => setTimeout(r, 3000));

      // Remove cookie banner & preview bar
      await send('Runtime.evaluate', {
        expression: `
          const bar = document.getElementById('preview-bar-iframe');
          if (bar) bar.remove();
          const cookie = document.querySelector('.shopify-policy-banner, [aria-label*="Cookie"]');
          if (cookie) cookie.remove();
          // Also set cookie consent in localStorage
          localStorage.setItem('shopify-cookie-consent', 'accepted');
        `
      });

      await new Promise(r => setTimeout(r, 1000));

      // 1. Capture Buy Box Full (100g, Buy 1 default)
      const shot1 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_tile_buybox_clean.png'), Buffer.from(shot1.result.data, 'base64'));
      console.log('Saved qa_tile_buybox_clean.png');

      // 2. Select 300g and Buy 3
      console.log('Switching to 300g and Buy 3...');
      await send('Runtime.evaluate', {
        expression: `
          const p300 = Array.from(document.querySelectorAll('#zvSizePills .zv-option-pill')).find(p => p.textContent.includes('300g'));
          if (p300) p300.click();
          const b3 = Array.from(document.querySelectorAll('.zv-tile-bundle-card')).find(c => c.getAttribute('data-bundle-tier') === '3');
          if (b3) b3.click();
        `
      });
      await new Promise(r => setTimeout(r, 800));

      const shot2 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_tile_300g_buy3_unlocked.png'), Buffer.from(shot2.result.data, 'base64'));
      console.log('Saved qa_tile_300g_buy3_unlocked.png');

      // 3. Scroll to How It Works & capture
      console.log('Scrolling to How It Works...');
      await send('Runtime.evaluate', {
        expression: `
          const hiw = document.querySelector('.tm-hiw-section');
          if (hiw) hiw.scrollIntoView({ behavior: 'instant', block: 'start' });
        `
      });
      await new Promise(r => setTimeout(r, 800));

      const shot3 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_tile_how_it_works_3cards.png'), Buffer.from(shot3.result.data, 'base64'));
      console.log('Saved qa_tile_how_it_works_3cards.png');

      // 4. Test Mobile (390px)
      console.log('Setting Mobile 390px viewport...');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });
      await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0);' });
      await new Promise(r => setTimeout(r, 800));

      const shotMob1 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_tile_mobile_buybox_final.png'), Buffer.from(shotMob1.result.data, 'base64'));
      console.log('Saved qa_tile_mobile_buybox_final.png');

      // Scroll to mobile How it works
      await send('Runtime.evaluate', {
        expression: `
          const hiw = document.querySelector('.tm-hiw-section');
          if (hiw) hiw.scrollIntoView({ behavior: 'instant', block: 'start' });
        `
      });
      await new Promise(r => setTimeout(r, 800));

      const shotMob2 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_tile_mobile_hiw_final.png'), Buffer.from(shotMob2.result.data, 'base64'));
      console.log('Saved qa_tile_mobile_hiw_final.png');

      chrome.kill();
      process.exit(0);
    });
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

