const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function testKey() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9270',
    '--window-size=1280,1000',
    'https://shfc473g83902f70-103245414771.shopifypreview.com/products_preview?preview_key=4413ea37d1354694083abb700c78f1e9'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  http.get('http://127.0.0.1:9270/json', res => {
    let raw = ''; res.on('data', c => raw += c);
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
            if (d.id === reqId) { ws.removeEventListener('message', h); r(d); }
          };
          ws.addEventListener('message', h);
          ws.send(JSON.stringify({ id: reqId, method: m, params: p }));
        });
      }
      await send('Page.enable');
      await send('Runtime.enable');
      await new Promise(r => setTimeout(r, 3000));
      const evalRes = await send('Runtime.evaluate', {
        expression: 'JSON.stringify({ url: window.location.href, title: document.title, h1: document.querySelector("h1")?.innerText, body: document.body?.innerText?.slice(0, 300) })'
      });
      console.log('Result:', JSON.parse(evalRes.result.value || '{}'));
      chrome.kill();
      process.exit(0);
    });
  });
}

testKey();

