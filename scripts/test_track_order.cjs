const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function testTrackOrder() {
  const url = 'https://trymalora.com/pages/track-order?preview_theme_id=197144805747';
  console.log('Testing track order in Chrome...');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9274',
    url
  ]);

  await new Promise(r => setTimeout(r, 2000));
  http.get('http://127.0.0.1:9274/json', res => {
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
      await new Promise(r => setTimeout(r, 3500));

      const res = await send('Runtime.evaluate', {
        expression: 'JSON.stringify({ url: window.location.href, title: document.title, h1: document.querySelector("h1")?.innerText, body: document.body?.innerText?.slice(0, 300) })'
      });
      console.log('Result:', JSON.parse(res.result.value || '{}'));
      chrome.kill();
      process.exit(0);
    });
  });
}

testTrackOrder();

