const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';

async function main() {
  console.log('Launching Chrome to set preview cookie...');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9275',
    '--window-size=1440,1100',
    'https://ikwh1h-fx.myshopify.com?preview_theme_id=197144805747'
  ]);

  await new Promise(r => setTimeout(r, 3000));

  http.get('http://127.0.0.1:9275/json', res => {
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

      // Check if password page
      console.log('Checking password...');
      await send('Runtime.evaluate', {
        expression: `
          const pw = document.querySelector('input[type="password"]');
          if (pw) {
            pw.value = 'lompea';
            const form = pw.closest('form');
            if (form) form.submit();
          }
        `
      });

      await new Promise(r => setTimeout(r, 3000));

      // Now navigate to product on preview theme
      console.log('Navigating to tile paint on draft theme...');
      await send('Page.navigate', {
        url: 'https://ikwh1h-fx.myshopify.com/products/tile-refinishing-paint-restoration-kit?preview_theme_id=197144805747'
      });

      await new Promise(r => setTimeout(r, 4500));

      // Check active theme in preview bar
      const themeName = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const bar = document.getElementById('preview-bar-iframe');
            return {
              barSrc: bar ? bar.src : null,
              hasColorSection: document.getElementById('zvColorSection') !== null,
              hasSizeSection: document.getElementById('zvSizeSection') !== null,
              bundleCardsCount: document.querySelectorAll('.zv-tile-bundle-card').length
            };
          })()
        `,
        returnByValue: true
      });

      console.log('Theme preview info:', themeName?.result?.value);

      // Remove cookie bar and preview bar for clean screenshot
      await send('Runtime.evaluate', {
        expression: `
          const b = document.getElementById('preview-bar-iframe');
          if (b) b.remove();
          const c = document.querySelector('.shopify-policy-banner, [aria-label*="Cookie"]');
          if (c) c.remove();
        `
      });

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_tile_draft_theme_verified.png'), Buffer.from(shot.result.data, 'base64'));
      console.log('Saved qa_tile_draft_theme_verified.png');

      chrome.kill();
      process.exit(0);
    });
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

