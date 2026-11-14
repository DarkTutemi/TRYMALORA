const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';

async function captureNewProduct() {
  const url = 'https://shfc473g83902f70-103245414771.shopifypreview.com/products_preview?preview_key=4413ea37d1354694083abb700c78f1e9&preview_theme_id=197144805747';
  console.log('Capturing Car Metal Rust Repair Paste...');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9273',
    '--window-size=1280,1200',
    url
  ]);

  await new Promise(r => setTimeout(r, 2000));
  http.get('http://127.0.0.1:9273/json', res => {
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
      await new Promise(r => setTimeout(r, 4000));

      await send('Runtime.evaluate', {
        expression: `
          const b = document.querySelector('.shopify-policy-banner, [aria-label*="Cookie"]');
          if (b) b.remove();
        `
      });

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_car_metal_rust_preview.png'), Buffer.from(shot.result.data, 'base64'));
      console.log('Saved qa_car_metal_rust_preview.png');
      chrome.kill();
      process.exit(0);
    });
  });
}

captureNewProduct();

