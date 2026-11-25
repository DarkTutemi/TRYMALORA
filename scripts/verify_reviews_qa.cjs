const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551';

async function testReviews() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9296',
    '--window-size=1280,1050',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://127.0.0.1:9296/json', res => {
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
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1280, height: 1050, deviceScaleFactor: 1, mobile: false
      });

      await send('Page.navigate', { url: 'https://trymalora.com/products/sleepylotion' });
      await new Promise(r => setTimeout(r, 5000));

      await send('Runtime.evaluate', {
        expression: `document.getElementById('MaloraReviewsWidget')?.scrollIntoView({ behavior: 'instant', block: 'start' })`
      });
      await new Promise(r => setTimeout(r, 1500));

      const r = await send('Page.captureScreenshot', { format: 'png' });
      const buf = Buffer.from(r.result.data, 'base64');
      const p1 = path.join(ARTIFACT_DIR, 'qa_malora_reviews_widget.png');
      fs.writeFileSync(p1, buf);
      console.log('Saved screenshot to', p1);

      chrome.kill();
      process.exit(0);
    });
  });
}

testReviews().catch(console.error);
