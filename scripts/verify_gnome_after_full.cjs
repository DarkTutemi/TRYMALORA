const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-audit-after';
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
          } catch (e) { reject(e); }
        });
      }).on('error', () => { if (++retries > 30) reject(new Error('WS timeout')); });
    }, 200);
  });
}

(async () => {
  const port = 9393;
  const p = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + userDataDir,
    '--window-size=1440,900'
  ]);

  try {
    const wsUrl = await getWsUrl(port);
    const ws = new WebSocket(wsUrl);
    let id = 1;
    const consoleErrors = [];
    const pageErrors = [];

    ws.addEventListener('message', (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        pageErrors.push(msg.params.exceptionDetails?.text || 'Exception');
      }
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
      }
    });

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
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

    const targetUrl = 'https://ikwh1h-fx.myshopify.com/products/christmas-lantern-welcome-gnome?preview_theme_id=197144805747';
    await send('Page.navigate', { url: targetUrl });
    await new Promise(r => setTimeout(r, 4500));

    // Dismiss cookie banners for clean visual check
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('#shopify-pc__banner, .shopify-policy__banner').forEach(e => e.remove());`
    });
    await new Promise(r => setTimeout(r, 300));

    // Capture AFTER desktop above-the-fold
    const dShot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactsDir, 'after_desktop_above_fold.png'), Buffer.from(dShot1.data, 'base64'));

    // 1. Test Gallery Zoom Lightbox
    const galleryZoomRes = await send('Runtime.evaluate', {
      expression: `(async () => {
        document.getElementById('zvGalleryZoomBtn')?.click();
        await new Promise(r => setTimeout(r, 1200));
        const lb = document.getElementById('zvGalleryLightbox');
        const img = document.getElementById('zvGalleryLbImg');
        const counter1 = document.getElementById('zvGalleryLbCounter')?.textContent;
        document.getElementById('zvGalleryLbNext')?.click();
        await new Promise(r => setTimeout(r, 1200));
        const counter2 = document.getElementById('zvGalleryLbCounter')?.textContent;
        return {
          opened: lb?.classList.contains('is-open'),
          imgComplete: img?.complete,
          imgNaturalWidth: img?.naturalWidth,
          counter1,
          counter2
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    const zoomShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactsDir, 'after_gallery_zoom.png'), Buffer.from(zoomShot.data, 'base64'));
    await send('Runtime.evaluate', { expression: `document.getElementById('zvGalleryLbClose')?.click();` });
    await new Promise(r => setTimeout(r, 300));

    // 2. Test Bundle Tiers + Quantity + Upsell Modal + Cart
    const tierQtyRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const tier1 = document.querySelector('.zv-gnome-bundle-card[data-bundle-tier="1"]');
        tier1?.click();
        const afterT1 = {
          heroPrice: document.getElementById('zvPriceActive')?.innerText,
          shippingText: document.getElementById('zvBundleShippingText')?.innerText,
          shippingClass: document.getElementById('zvBundleShippingBadge')?.className,
          atc: document.getElementById('zvBtnClaimLabel')?.innerText
        };
        const tier2 = document.querySelector('.zv-gnome-bundle-card[data-bundle-tier="2"]');
        tier2?.click();
        document.getElementById('zvQtyPlus')?.click(); // qty = 2
        const afterQty2 = {
          qty: document.getElementById('zvPackQtyInput')?.value,
          heroPrice: document.getElementById('zvPriceActive')?.innerText,
          shippingText: document.getElementById('zvBundleShippingText')?.innerText,
          atc: document.getElementById('zvBtnClaimLabel')?.innerText
        };
        document.getElementById('zvGnomeUpsellZoomTrigger')?.click();
        document.getElementById('zvUpsellModalAddBtn')?.click();
        const afterUpsell = {
          upsellChecked: document.getElementById('zvGnomeUpsellCheck')?.checked,
          atc: document.getElementById('zvBtnClaimLabel')?.innerText,
          stickyPrice: document.getElementById('zvStickyPrice')?.innerText
        };
        return { afterT1, afterQty2, afterUpsell };
      })()`,
      returnByValue: true
    });

    // 3. Test E2E Cart (/cart.js)
    const cartE2E = await send('Runtime.evaluate', {
      expression: `(async () => {
        await fetch('/cart/clear.js', { method: 'POST' });
        document.getElementById('zvBtnClaim')?.click();
        await new Promise(r => setTimeout(r, 2500));
        const res = await fetch('/cart.js');
        const c = await res.json();
        // Close drawer
        document.getElementById('willaCartClose')?.click();
        document.getElementById('willaCartDrawer')?.classList.remove('active');
        document.getElementById('willaCartOverlay')?.classList.remove('active');
        return {
          itemCount: c.item_count,
          totalPrice: c.total_price,
          items: c.items.map(i => ({ title: i.title, variant_id: i.variant_id, qty: i.quantity, line_price: i.line_price }))
        };
      })()`,
      awaitPromise: true,
      returnByValue: true
    });

    // 4. Scroll full page, verify images (0 hotlinks, 0 broken), review filters, and "Show full review" click
    for (let y = 0; y <= 8200; y += 650) {
      await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${y});` });
      await new Promise(r => setTimeout(r, 350));
    }
    await new Promise(r => setTimeout(r, 1200));

    const bodyCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const imgs = Array.from(document.querySelectorAll('img')).map(i => ({
          id: i.id, src: i.getAttribute('src') || '', naturalWidth: i.naturalWidth, complete: i.complete
        }));
        const broken = imgs.filter(i => !i.complete || i.naturalWidth === 0);
        const ncrovo = imgs.filter(i => i.src.includes('ncrovoprime'));
        const showFullBtn = document.querySelector('.tm-rev-readmore-btn');
        if (showFullBtn) showFullBtn.click();
        const revExpanded = showFullBtn ? (getComputedStyle(showFullBtn).display === 'none') : null;
        return {
          totalImgs: imgs.length,
          brokenCount: broken.length,
          broken,
          ncrovoHotlinks: ncrovo.length,
          hasLiveUrgencyPill: !!document.querySelector('.zv-live-viewers'),
          craftPill: document.querySelector('.zv-craft-highlight-pill')?.innerText || null,
          topRating: document.querySelector('.zv-pdp-rating-row')?.innerText.replace(/\\s+/g, ' ').trim(),
          faqSub: document.querySelector('.tm-faq-subtitle')?.innerText.trim(),
          revCount: document.querySelector('.tm-rev-count-label')?.innerText.trim(),
          filterChips: Array.from(document.querySelectorAll('.tm-filter-chip')).map(c => c.innerText.trim()),
          revExpandedOnClick: revExpanded
        };
      })()`,
      returnByValue: true
    });

    // Capture Reviews section screenshot
    await send('Runtime.evaluate', { expression: `document.getElementById('tmCustomerReviews')?.scrollIntoView({ behavior: 'instant' });` });
    await new Promise(r => setTimeout(r, 500));
    const revShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactsDir, 'after_desktop_reviews.png'), Buffer.from(revShot.data, 'base64'));

    // 5. Mobile checks (390x844)
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await send('Runtime.evaluate', { expression: `window.scrollTo(0, 0);` });
    await new Promise(r => setTimeout(r, 700));
    const mobTopShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactsDir, 'after_mobile_top.png'), Buffer.from(mobTopShot.data, 'base64'));

    await send('Runtime.evaluate', { expression: `window.scrollTo(0, 820);` });
    await new Promise(r => setTimeout(r, 500));
    const mobBuyShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactsDir, 'after_mobile_buybox.png'), Buffer.from(mobBuyShot.data, 'base64'));

    await send('Runtime.evaluate', { expression: `window.scrollTo(0, 3200);` });
    await new Promise(r => setTimeout(r, 600));
    const mobStickyCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const sb = document.getElementById('zvStickyBar');
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          overflowsMobile: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          stickyVisible: sb?.classList.contains('visible'),
          stickyRect: sb ? sb.getBoundingClientRect() : null,
          stickyLabel: document.getElementById('zvStickyBtnLabel')?.innerText
        };
      })()`,
      returnByValue: true
    });
    const mobStickyShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactsDir, 'after_mobile_sticky.png'), Buffer.from(mobStickyShot.data, 'base64'));

    // 6. Regression Check on Unrelated Product (ear-cleaner)
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: 'https://ikwh1h-fx.myshopify.com/products/ear-cleaner?preview_theme_id=197144805747' });
    await new Promise(r => setTimeout(r, 4000));
    const regCheck = await send('Runtime.evaluate', {
      expression: `(() => ({
        title: document.title,
        overflows: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        hasGnomeUpsell: !!document.getElementById('zvGnomeUpsellBox'),
        hasEarUpsell: !!document.getElementById('zvEarUpsellBox'),
        atc: document.getElementById('zvBtnClaimLabel')?.innerText
      }))()`,
      returnByValue: true
    });

    console.log(JSON.stringify({
      galleryZoom: galleryZoomRes.result?.value,
      tierQtyUpsell: tierQtyRes.result?.value,
      cartE2E: cartE2E.result?.value,
      bodyCheck: bodyCheck.result?.value,
      mobileSticky: mobStickyCheck.result?.value,
      regressionEarCleaner: regCheck.result?.value,
      jsPageErrors: pageErrors,
      jsConsoleErrors: consoleErrors
    }, null, 2));

    ws.close();
  } catch (err) {
    console.error('Verification Error:', err);
  } finally {
    p.kill();
  }
})();

