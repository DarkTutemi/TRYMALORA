const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-render-logo';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9293',
    '--window-size=600,200',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://127.0.0.1:9293/json', res => {
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
      await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });

      const svgContent = fs.readFileSync(path.join(__dirname, '..', 'assets', 'ultra-logo.svg'), 'utf8');
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&display=swap');
            body { margin: 0; padding: 20px; background: transparent; display: inline-block; }
            svg { width: 420px; height: auto; display: block; }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
        </html>
      `;

      await send('Page.navigate', { url: 'data:text/html;charset=utf-8,' + encodeURIComponent(html) });
      await new Promise(r => setTimeout(r, 2000));

      const clip = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const svg = document.querySelector('svg');
            const r = svg.getBoundingClientRect();
            return { x: r.x, y: r.y, width: r.width, height: r.height, scale: 2 };
          })()
        `,
        returnByValue: true
      });
      const c = clip.result.result.value;

      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: c.x, y: c.y, width: c.width, height: c.height, scale: 2 }
      });

      const outPath = path.join(__dirname, '..', 'assets', 'ultra-checkout-logo.png');
      fs.writeFileSync(outPath, Buffer.from(shot.result.data, 'base64'));
      console.log('Saved transparent logo PNG to:', outPath);

      ws.close();
      chrome.kill();
    });
  });
}

main().catch(console.error);

