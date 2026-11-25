const { spawn } = require('child_process');
const http = require('http');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--remote-debugging-port=9293', '--window-size=1440,900', 'about:blank']);
setTimeout(() => {
  http.get('http://127.0.0.1:9293/json', res => {
    let raw = ''; res.on('data', c => raw += c);
    res.on('end', async () => {
      const tab = JSON.parse(raw).find(t => t.type === 'page');
      const ws = new WebSocket(tab.webSocketDebuggerUrl);
      await new Promise(r => ws.addEventListener('open', r));
      let id = 1;
      const send = (m, p = {}) => new Promise(r => { const rid = id++; const h = e => { const d = JSON.parse(e.data); if (d.id === rid) { ws.removeEventListener('message', h); r(d); } }; ws.addEventListener('message', h); ws.send(JSON.stringify({ id: rid, method: m, params: p })); });
      await send('Page.enable'); await send('Runtime.enable');
      await send('Page.navigate', { url: 'https://trymalora.com/pages/about-us' });
      await new Promise(r => setTimeout(r, 4000));
      const resEval = await send('Runtime.evaluate', {
        expression: `Array.from(document.querySelectorAll('*')).filter(el => el.getBoundingClientRect().width > 1500).map(el => ({ tag: el.tagName, id: el.id, cls: el.className, w: el.getBoundingClientRect().width })).slice(0, 10)`,
        returnByValue: true
      });
      console.log('Wide elements:', JSON.stringify(resEval.result?.value, null, 2));
      chrome.kill(); process.exit(0);
    });
  });
}, 2000);
