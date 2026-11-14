const { spawn } = require('child_process');
const http = require('http');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-pixel2';

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
  const port = 9355;
  const p = spawn(chromePath, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + userDataDir, '--window-size=1440,1800']);
  const ws = new WebSocket(await getWsUrl(port));
  let id = 1;

  function send(m, params = {}) {
    return new Promise(r => {
      const curId = id++;
      const h = e => { const d = JSON.parse(e.data); if (d.id === curId) { ws.removeEventListener('message', h); r(d); } };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: curId, method: m, params }));
    });
  }
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  await send('Page.enable');

  await send('Page.navigate', { url: 'https://trymalora.com/products/metallic-silver-anti-rust-renovation-coating' });
  await new Promise(r => setTimeout(r, 4500));

  const check = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          fbqExists: typeof window.fbq === 'function',
          pixelId: window.fbq ? '767056089767666' : null,
          hasScriptTag: document.documentElement.innerHTML.includes('767056089767666')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('FBQ Evaluation:', check.result.result.value);

  ws.close();
  p.kill();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});

