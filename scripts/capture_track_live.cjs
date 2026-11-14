const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';

async function captureTrackLive() {
  console.log('Capturing Track Order on Live...');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9277',
    '--window-size=1280,1200',
    'https://trymalora.com/pages/track-order'
  ]);

  await new Promise(r => setTimeout(r, 2000));
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
      await new Promise(r => setTimeout(r, 3500));

      await send('Runtime.evaluate', {
        expression: `const b = document.querySelector('.shopify-policy-banner, [aria-label*="Cookie"]'); if (b) b.remove();`
      });

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'live_track_order_fixed.png'), Buffer.from(shot.result.data, 'base64'));
      console.log('Saved live_track_order_fixed.png');
      chrome.kill();
      process.exit(0);
    });
  });
}

captureTrackLive();

