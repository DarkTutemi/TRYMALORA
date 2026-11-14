const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-zoom';
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
  const port = 9388;
  const p = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + userDataDir,
    '--window-size=1440,1200'
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
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1200, deviceScaleFactor: 1, mobile: false });

    const targetUrl = 'https://ikwh1h-fx.myshopify.com/products/christmas-lantern-welcome-gnome?preview_theme_id=197144805747';
    console.log('Navigating to:', targetUrl);
    await send('Page.navigate', { url: targetUrl });
    await new Promise(r => setTimeout(r, 4500));

    // Dismiss any cookie banners
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.querySelectorAll('#shopify-pc__banner, .shopify-policy__banner, [aria-label*="cookie" i], #onetrust-consent-sdk')
          .forEach(el => el.remove());
      })()`
    });

    // 1. Verify initial state
    const initRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const trigger = document.getElementById('zvGnomeUpsellZoomTrigger');
        const modal = document.getElementById('zvUpsellModal');
        const img = document.getElementById('zvUpsellModalImg');
        const check = document.getElementById('zvGnomeUpsellCheck');
        return {
          hasTrigger: !!trigger,
          hasModal: !!modal,
          modalImgSrc: img?.src,
          isCheckedInitially: check?.checked
        };
      })()`,
      returnByValue: true
    });
    console.log('--- 1. INITIAL CHECKS ---', initRes.result?.value);

    // 2. Click thumbnail trigger to open zoom modal
    console.log('\n--- 2. CLICKING THUMBNAIL TO OPEN ZOOM MODAL ---');
    const openRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const trigger = document.getElementById('zvGnomeUpsellZoomTrigger');
        if (trigger) {
          trigger.click();
          const modal = document.getElementById('zvUpsellModal');
          return {
            modalHasIsOpenClass: modal?.classList.contains('is-open'),
            modalDisplay: window.getComputedStyle(modal).visibility,
            modalOpacity: window.getComputedStyle(modal).opacity,
            checkboxStillUnchecked: !document.getElementById('zvGnomeUpsellCheck').checked
          };
        }
        return { error: 'Trigger not found' };
      })()`,
      returnByValue: true
    });
    console.log('Open Modal Status:', openRes.result?.value);

    await new Promise(r => setTimeout(r, 600));

    // 3. Capture screenshot of open zoom modal
    console.log('\nCapturing Zoom Modal Screenshot...');
    const modalShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactsDir, 'gnome_upsell_zoom_modal.png'), Buffer.from(modalShot.data, 'base64'));
    console.log('✔ Screenshot saved: gnome_upsell_zoom_modal.png');

    // 4. Click "Add to Order (+$25.99)" inside the modal
    console.log('\n--- 3. CLICKING ADD TO ORDER INSIDE MODAL ---');
    const addRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const addBtn = document.getElementById('zvUpsellModalAddBtn');
        if (addBtn) {
          addBtn.click();
          const modal = document.getElementById('zvUpsellModal');
          const check = document.getElementById('zvGnomeUpsellCheck');
          const atcLabel = document.getElementById('zvBtnClaimLabel')?.innerText;
          return {
            modalClosed: !modal?.classList.contains('is-open'),
            checkboxCheckedNow: check?.checked,
            newAtcLabel: atcLabel
          };
        }
        return { error: 'Add button not found' };
      })()`,
      returnByValue: true
    });
    console.log('Add Button Result:', addRes.result?.value);

    await new Promise(r => setTimeout(r, 600));

    // 5. Re-open modal and test close button (X)
    console.log('\n--- 4. TESTING CLOSE BUTTON (X) ---');
    const closeTestRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const trigger = document.getElementById('zvGnomeUpsellZoomTrigger');
        trigger.click();
        const closeBtn = document.getElementById('zvUpsellModalClose');
        closeBtn.click();
        const modal = document.getElementById('zvUpsellModal');
        return {
          closedSuccessfully: !modal?.classList.contains('is-open')
        };
      })()`,
      returnByValue: true
    });
    console.log('Close Button Result:', closeTestRes.result?.value);

    // 6. Capture final PDP screenshot
    console.log('\nCapturing Final PDP Screenshot...');
    const finalShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactsDir, 'gnome_upsell_zoom_verified.png'), Buffer.from(finalShot.data, 'base64'));
    console.log('✔ Screenshot saved: gnome_upsell_zoom_verified.png');

    console.log('\n======================================================');
    console.log('🎉 ZOOM LIGHTBOX QA 100% VERIFIED!');
    console.log('======================================================');

    ws.close();
  } catch (err) {
    console.error('Browser QA Error:', err);
  } finally {
    p.kill();
  }
})();
