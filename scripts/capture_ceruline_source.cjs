const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551';

async function captureSource() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9289',
    '--window-size=1440,900',
    'about:blank'
  ]);
  await new Promise(r => setTimeout(r, 2000));

  http.get('http://127.0.0.1:9289/json', res => {
    let raw = ''; res.on('data', c => raw += c);
    res.on('end', async () => {
      const tab = JSON.parse(raw).find(t => t.type === 'page');
      const ws = new WebSocket(tab.webSocketDebuggerUrl);
      await new Promise(r => ws.addEventListener('open', r));

      let id = 1;
      const send = (m, p = {}) => new Promise(r => {
        const rid = id++;
        const h = e => { const d = JSON.parse(e.data); if (d.id === rid) { ws.removeEventListener('message', h); r(d); } };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: rid, method: m, params: p }));
      });

      await send('Page.enable');
      await send('Runtime.enable');

      // Desktop 1440x900
      await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url: 'https://ceruline.com/products/afm-dfm-disabler' });
      await new Promise(r => setTimeout(r, 5000));
      const dShot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'ceruline_source_desktop_1440.png'), Buffer.from(dShot.result.data, 'base64'));
      console.log('Saved ceruline_source_desktop_1440.png');

      // Mobile 390x844
      await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
      await new Promise(r => setTimeout(r, 2000));
      const mShot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'ceruline_source_mobile_390.png'), Buffer.from(mShot.result.data, 'base64'));
      console.log('Saved ceruline_source_mobile_390.png');

      chrome.kill();
      process.exit(0);
    });
  });
}

captureSource().catch(console.error);
