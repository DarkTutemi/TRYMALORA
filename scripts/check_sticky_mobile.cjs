const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const p = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9394',
  '--user-data-dir=C:\\Users\\Admin\\.chrome-sticky-check'
]);

function getWs() {
  return new Promise(res => {
    const t = setInterval(() => http.get('http://127.0.0.1:9394/json', r => {
      let d = ''; r.on('data', c => d += c);
      r.on('end', () => { clearInterval(t); res(JSON.parse(d)[0].webSocketDebuggerUrl); });
    }).on('error', () => {}), 200);
  });
}

(async () => {
  try {
    const ws = new WebSocket(await getWs());
    let id = 1;
    const send = (m, pa = {}) => new Promise(r => {
      const c = id++;
      const h = e => { const d = JSON.parse(e.data); if (d.id === c) { ws.removeEventListener('message', h); r(d.result); } };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: c, method: m, params: pa }));
    });
    await new Promise(r => ws.addEventListener('open', r, { once: true }));
    await send('Page.enable'); await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await send('Page.navigate', { url: 'https://ikwh1h-fx.myshopify.com/products/christmas-lantern-welcome-gnome?preview_theme_id=197144805747' });
    await new Promise(r => setTimeout(r, 6500));
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.querySelectorAll('#shopify-pc__banner').forEach(e => e.remove());
        window.scrollTo(0, 3200);
        const sb = document.getElementById('zvStickyBar');
        if (sb) sb.style.bottom = '60px'; // Temporarily lift above Shopify Admin preview bar just for visual inspection
      })()`
    });
    await new Promise(r => setTimeout(r, 700));
    const info = await send('Runtime.evaluate', {
      expression: `(() => {
        const sb = document.getElementById('zvStickyBar');
        return {
          visible: sb?.classList.contains('visible'),
          rect: sb ? sb.getBoundingClientRect() : null,
          label: document.getElementById('zvStickyBtnLabel')?.innerText
        };
      })()`,
      returnByValue: true
    });
    console.log('Mobile Sticky Bar:', JSON.stringify(info.result?.value));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\Admin\\.gemini\\antigravity\\brain\\43d9c775-1dab-4bdb-8d9b-3c1d86fa5c71\\after_mobile_sticky.png', Buffer.from(shot.data, 'base64'));
    ws.close();
  } finally { p.kill(); }
})();
