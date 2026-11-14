const { spawn } = require('child_process');
const http = require('http');

const p = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9392',
  '--user-data-dir=C:\\Users\\Admin\\.chrome-scroll-check'
]);

function getWs() {
  return new Promise(res => {
    const t = setInterval(() => http.get('http://127.0.0.1:9392/json', r => {
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
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: 'https://ikwh1h-fx.myshopify.com/products/christmas-lantern-welcome-gnome?preview_theme_id=197144805747' });
    await new Promise(r => setTimeout(r, 4000));
    for (let y = 0; y <= 8000; y += 600) {
      await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${y})` });
      await new Promise(r => setTimeout(r, 400));
    }
    await new Promise(r => setTimeout(r, 2000));
    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const imgs = Array.from(document.querySelectorAll('img')).map(i => ({
          id: i.id, cls: i.className, src: i.getAttribute('src'), naturalWidth: i.naturalWidth, complete: i.complete
        }));
        const sticky = document.getElementById('zvStickyBar');
        return {
          brokenAfterScroll: imgs.filter(i => !i.complete || i.naturalWidth === 0),
          totalImgs: imgs.length,
          stickyBar: sticky ? {
            cls: sticky.className,
            display: getComputedStyle(sticky).display,
            visibility: getComputedStyle(sticky).visibility,
            opacity: getComputedStyle(sticky).opacity,
            price: document.getElementById('zvStickyPrice')?.innerText,
            label: document.getElementById('zvStickyBtnLabel')?.innerText
          } : null
        };
      })()`,
      returnByValue: true
    });
    console.log(JSON.stringify(res.result.value, null, 2));
    ws.close();
  } finally {
    p.kill();
  }
})();

