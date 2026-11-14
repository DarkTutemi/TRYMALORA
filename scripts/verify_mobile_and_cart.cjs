const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-mobile-cart';
const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\43d9c775-1dab-4bdb-8d9b-3c1d86fa5c71';

function getWsUrl(port) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const interval = setInterval(() => {
      http.get('http://127.0.0.1:' + port + '/json', res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          clearInterval(interval);
          try {
            const tabs = JSON.parse(data);
            resolve((tabs.find(t => t.type === 'page') || tabs[0]).webSocketDebuggerUrl);
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', () => { if (++retries > 30) reject(); });
    }, 200);
  });
}

(async () => {
  const port = 9389;
  const p = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + userDataDir,
    '--window-size=390,844'
  ]);

  try {
    const wsUrl = await getWsUrl(port);
    const ws = new WebSocket(wsUrl);
    let id = 1;
    function send(m, params = {}) {
      return new Promise(r => {
        const curId = id++;
        const h = e => { 
          const d = JSON.parse(e.data); 
          if (d.id === curId) { 
            ws.removeEventListener('message', h); 
            r(d.result); 
          } 
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: curId, method: m, params }));
      });
    }

    await new Promise(r => ws.addEventListener('open', r, { once: true }));
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

    const targetUrl = 'https://ikwh1h-fx.myshopify.com/products/christmas-lantern-welcome-gnome?preview_theme_id=197144805747';
    console.log('Navigating to mobile PDP:', targetUrl);
    await send('Page.navigate', { url: targetUrl });
    await new Promise(r => setTimeout(r, 4500));

    // Dismiss cookie banners
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.querySelectorAll('#shopify-pc__banner, .shopify-policy__banner, [aria-label*="cookie" i], #onetrust-consent-sdk')
          .forEach(el => el.remove());
      })()`
    });

    // 1. Check horizontal overflow on mobile
    const layoutRes = await send('Runtime.evaluate', {
      expression: `(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          overflows: document.documentElement.scrollWidth > document.documentElement.clientWidth
        };
      })()`,
      returnByValue: true
    });
    console.log('--- 1. MOBILE LAYOUT CHECK ---', layoutRes.result?.value);

    // 2. Open Zoom Modal on mobile
    await send('Runtime.evaluate', {
      expression: `(() => {
        const trigger = document.getElementById('zvGnomeUpsellZoomTrigger');
        if (trigger) trigger.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 600));

    const modalCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const dialog = document.querySelector('.zv-lightbox-dialog');
        const rect = dialog ? dialog.getBoundingClientRect() : null;
        return {
          isOpen: document.getElementById('zvUpsellModal')?.classList.contains('is-open'),
          dialogRect: rect ? { width: rect.width, height: rect.height, left: rect.left, right: rect.right } : null,
          fitsInViewport: rect ? (rect.left >= 0 && rect.right <= window.innerWidth) : false
        };
      })()`,
      returnByValue: true
    });
    console.log('--- 2. MOBILE MODAL CHECK ---', modalCheck.result?.value);

    const mobileModalShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactsDir, 'gnome_mobile_zoom_modal.png'), Buffer.from(mobileModalShot.data, 'base64'));
    console.log('✔ Mobile Modal screenshot saved: gnome_mobile_zoom_modal.png');

    // 3. Click Add to Order in modal & test cart submission
    await send('Runtime.evaluate', {
      expression: `(() => {
        const addBtn = document.getElementById('zvUpsellModalAddBtn');
        if (addBtn) addBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 400));

    // Clear cart first, then click ADD TO CART and check /cart.js
    console.log('\n--- 3. TESTING ADD TO CART PAYLOAD & CART.JS ---');
    const cartTestRes = await send('Runtime.evaluate', {
      expression: `(async () => {
        await fetch('/cart/clear.js', { method: 'POST' });
        const atcBtn = document.getElementById('zvBtnClaim');
        if (!atcBtn) return { error: 'No ATC button' };
        atcBtn.click();
        await new Promise(r => setTimeout(r, 2500));
        const res = await fetch('/cart.js');
        const cart = await res.json();
        return {
          itemCount: cart.item_count,
          totalPriceCents: cart.total_price,
          items: cart.items.map(i => ({
            title: i.title,
            variant_id: i.variant_id,
            quantity: i.quantity,
            line_price: i.line_price
          }))
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Cart Result:', JSON.stringify(cartTestRes.result?.value, null, 2));

    console.log('\n======================================================');
    console.log('🎉 MOBILE & CART E2E VERIFICATION COMPLETE!');
    console.log('======================================================');

    ws.close();
  } catch (err) {
    console.error('Mobile QA Error:', err);
  } finally {
    p.kill();
  }
})();

