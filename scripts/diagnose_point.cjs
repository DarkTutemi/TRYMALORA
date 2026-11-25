const { spawn } = require('child_process');
const http = require('http');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--remote-debugging-port=9290', '--window-size=1440,900', 'about:blank']);
setTimeout(() => {
  http.get('http://127.0.0.1:9290/json', res => {
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
        expression: `(() => {
          const elAtPoint = document.elementFromPoint(700, 300);
          const h1 = document.querySelector('h1');
          const wrap = document.querySelector('.malora-pdp-wrapper');
          return JSON.stringify({
            atPoint: elAtPoint ? { tag: elAtPoint.tagName, id: elAtPoint.id, cls: elAtPoint.className, bg: getComputedStyle(elAtPoint).backgroundColor } : null,
            wrapRect: wrap ? wrap.getBoundingClientRect() : null,
            h1Rect: h1 ? h1.getBoundingClientRect() : null,
            h1Text: h1 ? h1.innerText : null
          });
        })()`,
        returnByValue: true
      });
      console.log('DIAGNOSTIC:', resEval.result?.result?.value || JSON.stringify(resEval));
      chrome.kill(); process.exit(0);
    });
  });
}, 2000);
