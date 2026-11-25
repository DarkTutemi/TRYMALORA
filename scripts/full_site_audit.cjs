const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551';

const pages = [
  { name: 'home', url: 'https://trymalora.com/' },
  { name: 'pdp', url: 'https://trymalora.com/products/sleepylotion' },
  { name: 'collection', url: 'https://trymalora.com/collections/bundle' },
  { name: 'about', url: 'https://trymalora.com/pages/about-us' },
  { name: 'track', url: 'https://trymalora.com/pages/track-order' },
  { name: 'contact', url: 'https://trymalora.com/pages/contact' }
];

async function audit() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9292',
    '--window-size=1440,900',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://127.0.0.1:9292/json', res => {
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
      await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

      for (const p of pages) {
        console.log(`\n=== AUDITING ${p.name.toUpperCase()} (${p.url}) ===`);
        await send('Page.navigate', { url: p.url });
        await new Promise(r => setTimeout(r, 4000));

        const check = await send('Runtime.evaluate', {
          expression: `JSON.stringify({
            title: document.title,
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            brokenImages: Array.from(document.querySelectorAll('img')).filter(i => i.complete && i.naturalWidth === 0).map(i => i.src).slice(0, 5),
            h1: document.querySelector('h1')?.innerText?.trim()
          })`,
          returnByValue: true
        });
        console.log('Metrics:', check.result?.value);

        const shot = await send('Page.captureScreenshot', { format: 'png' });
        const outPath = path.join(ARTIFACT_DIR, `audit_${p.name}.png`);
        fs.writeFileSync(outPath, Buffer.from(shot.result.data, 'base64'));
        console.log('Screenshot:', outPath);
      }

      chrome.kill();
      process.exit(0);
    });
  });
}

audit().catch(console.error);
