const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';

async function verifyLive() {
  console.log('Verifying Live Storefront...');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9276',
    '--window-size=1280,1100',
    'https://trymalora.com/'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  http.get('http://127.0.0.1:9276/json', res => {
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

      // Test Track Order
      console.log('Testing /pages/track-order on live...');
      await send('Page.navigate', { url: 'https://trymalora.com/pages/track-order' });
      await new Promise(r => setTimeout(r, 3500));
      await send('Runtime.evaluate', {
        expression: `const b = document.querySelector('.shopify-policy-banner, [aria-label*="Cookie"]'); if (b) b.remove();`
      });

      const shotTrack = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'live_track_order_verified.png'), Buffer.from(shotTrack.result.data, 'base64'));

      const trackInfo = await send('Runtime.evaluate', {
        expression: `JSON.stringify({
          url: window.location.href,
          title: document.title,
          h1: document.querySelector('h1')?.innerText,
          hasCarrierActive: document.body.innerText.includes('Real-Time Carrier Tracking Active'),
          hasForm: !!document.querySelector('.zv-track-form, #trackingNumberInput')
        })`
      });
      console.log('Track Order Page:', JSON.parse(trackInfo.result.value || '{}'));

      // Test Car Metal Rust Repair Paste on live
      console.log('Testing Car Metal Rust Repair Paste on live...');
      await send('Page.navigate', { url: 'https://trymalora.com/products/car-metal-rust-repair-paste' });
      await new Promise(r => setTimeout(r, 3500));
      await send('Runtime.evaluate', {
        expression: `const b = document.querySelector('.shopify-policy-banner, [aria-label*="Cookie"]'); if (b) b.remove();`
      });

      const shotCar = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'live_car_rust_verified.png'), Buffer.from(shotCar.result.data, 'base64'));

      const carInfo = await send('Runtime.evaluate', {
        expression: `JSON.stringify({
          url: window.location.href,
          title: document.title,
          h1: document.querySelector('h1')?.innerText,
          price: document.querySelector('.zv-price, .tm-live-price')?.innerText,
          bodyText: document.body?.innerText?.slice(0, 300)
        })`
      });
      console.log('Car Rust Product Page:', JSON.parse(carInfo.result.value || '{}'));

      // Test Live Laser Battle Set
      console.log('Testing Laser Battle Set on live...');
      await send('Page.navigate', { url: 'https://trymalora.com/products/kids-infrared-battle-blaster-set-with-target-projector' });
      await new Promise(r => setTimeout(r, 3500));
      await send('Runtime.evaluate', {
        expression: `const b = document.querySelector('.shopify-policy-banner, [aria-label*="Cookie"]'); if (b) b.remove();`
      });

      const shotLaser = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'live_laser_product_verified.png'), Buffer.from(shotLaser.result.data, 'base64'));

      chrome.kill();
      process.exit(0);
    });
  });
}

verifyLive();

