const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-silver-images';

function getWsUrl(port) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const interval = setInterval(() => {
      http.get('http://127.0.0.1:' + port + '/json', res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          clearInterval(interval);
          try {
            const tabs = JSON.parse(data);
            resolve((tabs.find(t => t.type === 'page') || tabs[0]).webSocketDebuggerUrl);
          } catch(e) {
            reject(e);
          }
        });
      }).on('error', () => { if (++retries > 30) reject(); });
    }, 200);
  });
}

(async () => {
  const port = 9349;
  const p = spawn(chromePath, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + userDataDir, '--window-size=1440,2000']);
  const ws = new WebSocket(await getWsUrl(port));
  let id = 1;
  function send(m, params = {}) {
    return new Promise(r => {
      const curId = id++;
      const h = e => { const d = JSON.parse(e.data); if (d.id === curId) { ws.removeEventListener('message', h); r(d.result); } };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: curId, method: m, params }));
    });
  }
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  await send('Page.enable');
  await send('Page.navigate', { url: 'https://trymalora.com/products/metallic-silver-anti-rust-renovation-coating' });
  await new Promise(r => setTimeout(r, 4500));

  const res = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const mainSrc = document.getElementById('zvMainImg')?.src;
        const thumbs = Array.from(document.querySelectorAll('.zv-pdp-thumb img')).map((img, i) => ({
          idx: i + 1,
          src: img.src,
          dataSrc: img.parentElement.getAttribute('data-src')
        }));
        return { mainSrc, thumbsCount: thumbs.length, thumbs };
      })()
    `,
    returnByValue: true
  });

  console.log('--- GALLERY IMAGES VERIFICATION ---');
  console.log(JSON.stringify(res.result.value, null, 2));

  // Take screenshot of gallery area
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  const artDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
  fs.writeFileSync(path.join(artDir, 'qa_silver_8_images_verified.png'), Buffer.from(screenshot.data, 'base64'));
  console.log('Screenshot saved to qa_silver_8_images_verified.png');

  ws.close();
  p.kill();
})();

