const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-reviews';

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
          } catch(e) {
            reject(e);
          }
        });
      }).on('error', () => { if (++retries > 30) reject(); });
    }, 200);
  });
}

(async () => {
  const port = 9352;
  const p = spawn(chromePath, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + userDataDir, '--window-size=1440,2200']);
  const ws = new WebSocket(await getWsUrl(port));
  let id = 1;
  function send(m, params = {}) {
    return new Promise(r => {
      const curId = id++;
      const h = e => { const d = JSON.parse(e.data); if (d.id === curId) { ws.removeEventListener('message', h); r(d); } };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: curId, method: m, params }));
    });
  }
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  await send('Page.enable');

  console.log('Navigating to Metallic Silver PDP...');
  await send('Page.navigate', { url: 'https://trymalora.com/products/metallic-silver-anti-rust-renovation-coating' });
  await new Promise(r => setTimeout(r, 4500));

  // Scroll to review section
  console.log('Scrolling to review section...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const sec = document.getElementById('tmCustomerReviews');
        if (sec) sec.scrollIntoView();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 2000));

  // Inspect review elements
  const reviewInfo = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const title = document.querySelector('.tm-reviews-title')?.innerText.trim();
        const score = document.querySelector('.tm-rev-big-score')?.innerText.trim();
        const count = document.querySelector('.tm-rev-count-label')?.innerText.trim();
        const cardsCount = document.querySelectorAll('.tm-rev-card').length;
        const firstCardAuthor = document.querySelector('.tm-rev-card-author')?.innerText.trim();
        const firstCardText = document.querySelector('.tm-rev-card-content')?.innerText.trim();
        const paginationVisible = document.getElementById('tmReviewsPagination')?.offsetParent !== null;
        return { title, score, count, cardsCount, firstCardAuthor, firstCardText, paginationVisible };
      })()
    `,
    returnByValue: true
  });
  console.log('Review section info:', JSON.stringify(reviewInfo.result.value, null, 2));

  // Screenshot review section
  const revShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_silver_reviews_section.png', Buffer.from(revShot.result.data, 'base64'));
  console.log('Saved qa_silver_reviews_section.png');

  // Test opening Lightbox
  console.log('Testing Lightbox open on first card...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const firstMedia = document.querySelector('.tm-rev-card-media');
        if (firstMedia) firstMedia.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  const lbShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_silver_reviews_lightbox.png', Buffer.from(lbShot.result.data, 'base64'));
  console.log('Saved qa_silver_reviews_lightbox.png');

  // Test other product to verify isolation
  console.log('Verifying isolation on Tile Paint PDP...');
  await send('Page.navigate', { url: 'https://trymalora.com/products/tile-refinishing-paint-restoration-kit' });
  await new Promise(r => setTimeout(r, 3500));
  const otherCheck = await send('Runtime.evaluate', {
    expression: `Boolean(document.getElementById('tmCustomerReviews'))`,
    returnByValue: true
  });
  console.log('Is reviews section present on Tile Paint PDP? (Must be false):', otherCheck.result.value);

  ws.close();
  p.kill();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});

