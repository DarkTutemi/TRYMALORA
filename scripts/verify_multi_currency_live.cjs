const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551';

const MARKETS = [
  { code: 'US', currency: 'USD', name: 'United States' },
  { code: 'VN', currency: 'VND', name: 'Vietnam' },
  { code: 'AU', currency: 'AUD', name: 'Australia' },
  { code: 'DE', currency: 'EUR', name: 'Germany (EUR)' }
];

async function run() {
  console.log('================================================================');
  console.log('TRYMALORA — LIVE MULTI-CURRENCY END-TO-END QA AUDIT (V2)');
  console.log('Testing Markets: US (USD), VN (VND), AU (AUD), DE (EUR)');
  console.log('================================================================\n');

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9292',
    '--window-size=1280,1100',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://127.0.0.1:9292/json', res => {
    let raw = '';
    res.on('data', c => raw += c);
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
            if (d.id === reqId) {
              ws.removeEventListener('message', h);
              r(d);
            }
          };
          ws.addEventListener('message', h);
          ws.send(JSON.stringify({ id: reqId, method: m, params: p }));
        });
      }

      await send('Page.enable');
      await send('Runtime.enable');
      await send('DOM.enable');

      await send('Emulation.setDeviceMetricsOverride', {
        width: 1280,
        height: 1100,
        deviceScaleFactor: 1,
        mobile: false
      });

      const auditResults = [];

      for (const m of MARKETS) {
        console.log(`\n================================================================`);
        console.log(`>>> TESTING MARKET: ${m.name} (${m.code} / ${m.currency}) <<<`);
        console.log(`================================================================`);

        // 1. Navigate to root
        await send('Page.navigate', { url: 'https://trymalora.com/' });
        await new Promise(r => setTimeout(r, 3000));

        // 2. Clear cart and set localization via POST /localization
        await send('Runtime.evaluate', {
          expression: `
            (async function() {
              await fetch('/cart/clear.js', { method: 'POST' });
              const fd = new FormData();
              fd.append('_method', 'PUT');
              fd.append('country_code', '${m.code}');
              await fetch('/localization', { method: 'POST', body: fd });
            })()
          `,
          awaitPromise: true
        });

        // 3. Navigate to PDP
        await send('Page.navigate', { url: 'https://trymalora.com/products/full-spine-ultra-overnight' });
        await new Promise(r => setTimeout(r, 4500));

        // 4. Extract PDP details
        const pdpData = await send('Runtime.evaluate', {
          expression: `
            (function() {
              const uoLoc = window.UO_LOCALIZATION || {};
              const shopifyCurr = window.Shopify?.currency || {};
              const annBar = document.querySelector('.ultra-announcement-bar, .uo-announcement-bar')?.textContent?.trim() || '';
              
              const mainPrice = document.querySelector('.uo-price-current')?.textContent?.trim() || '';
              const comparePrice = document.querySelector('#uoPriceCompare')?.textContent?.trim() || '';
              
              const tier1 = document.querySelector('.uo-tier-card[data-tier="1-pair"]');
              const tier3 = document.querySelector('.uo-tier-card[data-tier="3-pairs"]');
              const tier5 = document.querySelector('.uo-tier-card[data-tier="5-pairs"]');
              
              const getTierInfo = (el) => {
                if (!el) return null;
                return {
                  price: el.querySelector('.uo-tier-final-price')?.textContent?.trim() || '',
                  orig: el.querySelector('.uo-tier-orig-price')?.textContent?.trim() || '',
                  unit: el.querySelector('.uo-tier-unit')?.textContent?.trim() || '',
                  save: el.querySelector('.uo-tier-savings-note, .uo-tier-save-pill')?.textContent?.trim() || '',
                  ship: el.querySelector('.uo-tier-shipping-tag')?.textContent?.trim() || ''
                };
              };
              
              return {
                uoLoc,
                shopifyCurr,
                annBar,
                mainPrice,
                comparePrice,
                tier1: getTierInfo(tier1),
                tier3: getTierInfo(tier3),
                tier5: getTierInfo(tier5)
              };
            })()
          `,
          returnByValue: true
        });

        const pdpRes = pdpData.result?.result?.value;
        console.log(`  Shopify Currency: ${pdpRes.shopifyCurr.active}`);
        console.log(`  UO Localization: Country: ${pdpRes.uoLoc.countryCode}, Currency: ${pdpRes.uoLoc.currencyCode}, isUS: ${pdpRes.uoLoc.isUS}`);
        console.log(`  Announcement Bar: "${pdpRes.annBar.substring(0, 60)}..."`);
        console.log(`  Main Price: ${pdpRes.mainPrice} | Compare: ${pdpRes.comparePrice}`);
        console.log(`  Tier 1 (1 Pair): Final: ${pdpRes.tier1?.price} | Unit: ${pdpRes.tier1?.unit}`);
        console.log(`  Tier 3 (3 Pairs): Final: ${pdpRes.tier3?.price} | Orig: ${pdpRes.tier3?.orig} | Unit: ${pdpRes.tier3?.unit} | Save: ${pdpRes.tier3?.save} | Ship: ${pdpRes.tier3?.ship}`);
        console.log(`  Tier 5 (5 Pairs): Final: ${pdpRes.tier5?.price} | Orig: ${pdpRes.tier5?.orig} | Unit: ${pdpRes.tier5?.unit} | Save: ${pdpRes.tier5?.save} | Ship: ${pdpRes.tier5?.ship}`);

        // 5. Test Add to Bag with default 3 Pairs
        console.log('  Adding 3 Pairs to Cart...');
        await send('Runtime.evaluate', {
          expression: `
            (function() {
              const atc = document.querySelector('.uo-pdp-atc-btn');
              if (atc) {
                atc.click();
              }
            })()
          `
        });

        // Wait for cart drawer to open & refresh
        await new Promise(r => setTimeout(r, 4000));

        // 6. Extract Cart Drawer details
        const cartData = await send('Runtime.evaluate', {
          expression: `
            (function() {
              const drawer = document.getElementById('willaCartDrawer');
              const isActive = drawer?.classList.contains('active') || drawer?.classList.contains('is-active');
              const count = document.getElementById('willaDrawerCount')?.textContent?.trim() || '';
              const shipMsg = document.getElementById('willaShippingText')?.textContent?.trim() || '';
              
              const fill = document.getElementById('willaShippingFill');
              const fillDisplay = fill ? window.getComputedStyle(fill).display : 'none';
              const fillWidth = fill ? fill.style.width : '0%';
              
              const item = drawer?.querySelector('.willa-cart-item');
              const itemTitle = item?.querySelector('.cart-item-title')?.textContent?.trim() || '';
              const itemFinal = item?.querySelector('.cart-item-final-price')?.textContent?.trim() || '';
              const itemOrig = item?.querySelector('.cart-item-orig-price')?.textContent?.trim() || '';
              const itemQty = item?.querySelector('.cart-qty-val')?.textContent?.trim() || '';
              
              const subtotal = document.getElementById('willaDrawerSubtotal')?.textContent?.trim() || '';
              const origSubtotal = document.getElementById('willaOrigSubtotal')?.textContent?.trim() || '';
              const savings = document.querySelector('.willa-subtotal-savings span:last-child')?.textContent?.trim() || '';
              
              const upsell = document.getElementById('willaUpsellCard');
              const upsellDisplay = upsell ? window.getComputedStyle(upsell).display : 'none';
              const upsellTitle = upsell?.querySelector('.willa-upsell-title')?.textContent?.trim() || '';
              const upsellPrice = upsell?.querySelector('.willa-upsell-price')?.textContent?.trim() || '';
              const upsellCompare = upsell?.querySelector('.willa-upsell-compare')?.textContent?.trim() || '';
              
              return {
                isActive,
                count,
                shipMsg,
                fillDisplay,
                fillWidth,
                itemTitle,
                itemFinal,
                itemOrig,
                itemQty,
                subtotal,
                origSubtotal,
                savings,
                upsellDisplay,
                upsellTitle,
                upsellPrice,
                upsellCompare
              };
            })()
          `,
          returnByValue: true
        });

        const cartRes = cartData.result?.result?.value;
        console.log(`  Cart Drawer Active: ${cartRes.isActive}`);
        console.log(`  Cart Count: ${cartRes.count}`);
        console.log(`  Cart Item: ${cartRes.itemTitle} (Qty: ${cartRes.itemQty}) | Price: ${cartRes.itemFinal} (Orig: ${cartRes.itemOrig})`);
        console.log(`  Cart Subtotal: ${cartRes.subtotal} (Orig: ${cartRes.origSubtotal}, Savings: ${cartRes.savings})`);
        console.log(`  Cart Shipping Note: "${cartRes.shipMsg}"`);
        console.log(`  Progress Fill: Display=${cartRes.fillDisplay}, Width=${cartRes.fillWidth}`);
        console.log(`  Upsell Companion: "${cartRes.upsellTitle}" | Price: ${cartRes.upsellPrice} (Compare: ${cartRes.upsellCompare}) [Display: ${cartRes.upsellDisplay}]`);

        // Capture screenshot of PDP + Cart Drawer
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        const shotPath = path.join(ARTIFACT_DIR, `qa_multicurrency_${m.code.toLowerCase()}_pdp_cart.png`);
        fs.writeFileSync(shotPath, Buffer.from(shot.result.data, 'base64'));
        console.log(`  [SCREENSHOT SAVED] ${shotPath}`);

        auditResults.push({
          market: m,
          pdp: pdpRes,
          cart: cartRes,
          screenshot: shotPath
        });
      }

      console.log('\n================================================================');
      console.log('MULTI-CURRENCY LIVE AUDIT COMPREHENSIVE SUMMARY');
      console.log('================================================================');
      console.table(auditResults.map(r => ({
        Market: r.market.code,
        Currency: r.market.currency,
        ActiveCurr: r.pdp.shopifyCurr.active,
        'PDP 1 Pair': r.pdp.tier1?.price,
        'PDP 3 Pairs': r.pdp.tier3?.price,
        'PDP 5 Pairs': r.pdp.tier5?.price,
        'Cart Subtotal': r.cart.subtotal,
        'Upsell Price': r.cart.upsellPrice,
        'Cart Active': r.cart.isActive
      })));

      ws.close();
      chrome.kill();
      process.exit(0);
    });
  });
}

run().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
