const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';

const products = [
  { name: 'Car Rust', handle: 'car-metal-rust-repair-paste', file: 'live_final_car_rust.png' },
  { name: 'Metallic Silver', handle: 'metallic-silver-anti-rust-renovation-coating', file: 'live_final_silver_coating.png' },
  { name: 'Chrome Polish', handle: 'metal-chrome-polish-restorer-paste', file: 'live_final_chrome_polish.png' },
  { name: 'Styling Iron', handle: 'mini-dual-purpose-travel-styling-iron', file: 'live_final_styling_iron.png' },
  { name: 'Tile Kit', handle: 'tile-refinishing-paint-restoration-kit', file: 'live_final_tile_kit.png' }
];

async function captureAllLive() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9279',
    '--window-size=1280,1200',
    'https://trymalora.com/products/' + products[0].handle
  ]);

  await new Promise(r => setTimeout(r, 2000));
  http.get('http://127.0.0.1:9279/json', res => {
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

      for (const p of products) {
        console.log(`Navigating to https://trymalora.com/products/${p.handle}...`);
        await send('Page.navigate', { url: 'https://trymalora.com/products/' + p.handle });
        await new Promise(r => setTimeout(r, 3500));
        await send('Runtime.evaluate', {
          expression: `const b = document.querySelector('.shopify-policy-banner, [aria-label*="Cookie"]'); if (b) b.remove();`
        });
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACT_DIR, p.file), Buffer.from(shot.result.data, 'base64'));
        console.log(`  Saved ${p.file}`);
      }

      chrome.kill();
      process.exit(0);
    });
  });
}

captureAllLive();

