const { spawn } = require('child_process');
const http = require('http');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--remote-debugging-port=9291', '--window-size=1440,900', 'about:blank']);
setTimeout(() => {
  http.get('http://127.0.0.1:9291/json', res => {
    let raw = ''; res.on('data', c => raw += c);
    res.on('end', async () => {
      const tab = JSON.parse(raw).find(t => t.type === 'page');
      const ws = new WebSocket(tab.webSocketDebuggerUrl);
      await new Promise(r => ws.addEventListener('open', r));
      let id = 1;
      const send = (m, p = {}) => new Promise(r => { const rid = id++; const h = e => { const d = JSON.parse(e.data); if (d.id === rid) { ws.removeEventListener('message', h); r(d); } }; ws.addEventListener('message', h); ws.send(JSON.stringify({ id: rid, method: m, params: p })); });
      await send('Page.enable'); await send('Runtime.enable');
      await send('Page.navigate', { url: 'https://trymalora.com/products/sleepylotion' });
      await new Promise(r => setTimeout(r, 4000));
      const resEval = await send('Runtime.evaluate', {
        expression: `JSON.stringify({
          wrapperRect: document.querySelector('.malora-pdp-wrapper')?.getBoundingClientRect(),
          wrapperStyle: (() => { const el = document.querySelector('.malora-pdp-wrapper'); if (!el) return null; const s = getComputedStyle(el); return { display: s.display, opacity: s.opacity, visibility: s.visibility, height: s.height, marginTop: s.marginTop, position: s.position, zIndex: s.zIndex }; })(),
          mainRect: document.querySelector('#MainContent')?.getBoundingClientRect(),
          bodyRect: document.body.getBoundingClientRect(),
          h1Rect: document.querySelector('h1')?.getBoundingClientRect(),
          h1Text: document.querySelector('h1')?.innerText
        })`,
        returnByValue: true
      });
      console.log('PDP Debug:', resEval.result?.value);
      chrome.kill(); process.exit(0);
    });
  });
}, 2000);
