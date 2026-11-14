const { spawn } = require('child_process');
const http = require('http');

async function test(url) {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9267',
    url
  ]);

  await new Promise(r => setTimeout(r, 2000));
  return new Promise((resolve) => {
    http.get('http://127.0.0.1:9267/json', res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', async () => {
        const tabs = JSON.parse(d);
        const tab = tabs.find(t => t.type === 'page');
        const ws = new WebSocket(tab.webSocketDebuggerUrl);
        let id = 1;
        function send(method, params = {}) {
          return new Promise(r => {
            const reqId = id++;
            const h = e => {
              const data = JSON.parse(e.data);
              if (data.id === reqId) { ws.removeEventListener('message', h); r(data); }
            };
            ws.addEventListener('message', h);
            ws.send(JSON.stringify({ id: reqId, method, params }));
          });
        }
        await new Promise(r => setTimeout(r, 3500));
        const res = await send('Runtime.evaluate', {
          expression: 'JSON.stringify({ url: window.location.href, title: document.title, h1: document.querySelector("h1")?.innerText, body: document.body?.innerText?.slice(0, 300) })'
        });
        chrome.kill();
        resolve(JSON.parse(res.result.value || '{}'));
      });
    });
  });
}

async function run() {
  console.log('Testing Laser product...');
  const res1 = await test('https://trymalora.com/products/kids-infrared-battle-blaster-set-with-target-projector?preview_theme_id=197144805747');
  console.log('Laser product result:', res1);

  console.log('\nTesting Draft product 1...');
  const res2 = await test('https://trymalora.com/products/car-metal-rust-repair-paste?preview_theme_id=197144805747');
  console.log('Draft product result:', res2);
}

run();

