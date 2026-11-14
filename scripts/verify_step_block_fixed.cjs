const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-test-step-fix';
const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';

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
  const port = 9410;
  const p = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + userDataDir,
    '--window-size=1440,1200'
  ]);

  const ws = new WebSocket(await getWsUrl(port));
  let id = 1;
  function send(m, params = {}) {
    return new Promise(r => {
      const curId = id++;
      const h = e => { 
        const d = JSON.parse(e.data); 
        if (d.id === curId) { 
          ws.removeEventListener('message', h); 
          r(d.result); 
        } 
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: curId, method: m, params }));
    });
  }
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  await send('Page.enable');

  console.log('Navigating to live PDP...');
  await send('Page.navigate', { url: 'https://trymalora.com/products/eyvelle-steam-therapy' });
  await new Promise(r => setTimeout(r, 4500));

  // Check step items
  const stepInfo = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const band = document.querySelector('.tm-setup-band');
        if (!band) return null;
        const imgs = Array.from(band.querySelectorAll('img')).map(i => i.src);
        const steps = Array.from(band.querySelectorAll('.tm-setup-col')).map(col => ({
          num: col.querySelector('.tm-setup-num')?.textContent?.trim(),
          title: col.querySelector('.tm-setup-step-title')?.textContent?.trim(),
          desc: col.querySelector('.tm-setup-step-desc')?.textContent?.trim(),
          hasImg: col.querySelectorAll('img').length > 0
        }));
        return { imgsCount: imgs.length, steps };
      })()
    `,
    returnByValue: true
  });
  console.log('Step Info:', JSON.stringify(stepInfo.result.value, null, 2));

  // Scroll to step band and capture screenshot
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.tm-setup-band')?.scrollIntoView({ behavior: 'instant', block: 'center' })`
  });
  await new Promise(r => setTimeout(r, 1000));
  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactsDir, 'qa_steam_therapy_clean_steps.png'), Buffer.from(ss.data, 'base64'));
  console.log('[SAVED] qa_steam_therapy_clean_steps.png');

  ws.close();
  p.kill();
  process.exit(0);
})();

