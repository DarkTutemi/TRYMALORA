const { spawn } = require('child_process');
const http = require('http');

async function getPreviewLinks() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9271',
    'https://trymalora.com/?preview_theme_id=197144805747'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  http.get('http://127.0.0.1:9271/json', res => {
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
      await new Promise(r => setTimeout(r, 4000));

      const res = await send('Runtime.evaluate', {
        expression: `(() => {
          const iframe = document.getElementById('preview-bar-iframe');
          let iframeDoc = null;
          try { iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document; } catch(e) {}
          return {
            iframeFound: !!iframe,
            shareBtn: iframeDoc?.querySelector('button[aria-label*=\"Share\"], [aria-label*=\"Copy\"]')?.outerHTML,
            allLinks: Array.from(document.querySelectorAll('a')).map(a => a.href)
          };
        })()`,
        returnByValue: true
      });
      console.log('Result:', JSON.stringify(res.result.value, null, 2));
      chrome.kill();
      process.exit(0);
    });
  });
}

getPreviewLinks();

