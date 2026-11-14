import fs from 'fs';

async function fetchSource() {
  const jsonUrl = 'https://eyvelle.com/products/eyvelle-steam-therapy.json';
  console.log('Fetching', jsonUrl);
  try {
    const res = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
      }
    });
    console.log('JSON Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      fs.writeFileSync('scripts/eyvelle_steam_therapy.json', JSON.stringify(data, null, 2), 'utf8');
      console.log('Saved product JSON. Title:', data.product?.title);
      console.log('Variants count:', data.product?.variants?.length);
      console.log('Images count:', data.product?.images?.length);
    } else {
      const t = await res.text();
      console.log('JSON failed body:', t.slice(0, 300));
    }
  } catch(e) {
    console.error('Error fetching json:', e.message);
  }

  const htmlUrl = 'https://eyvelle.com/products/eyvelle-steam-therapy';
  console.log('Fetching HTML', htmlUrl);
  try {
    const res = await fetch(htmlUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
      }
    });
    console.log('HTML Status:', res.status);
    if (res.ok) {
      const html = await res.text();
      fs.writeFileSync('scripts/eyvelle_steam_therapy.html', html, 'utf8');
      console.log('Saved product HTML. Size:', html.length);
    } else {
      const t = await res.text();
      console.log('HTML failed body:', t.slice(0, 300));
    }
  } catch(e) {
    console.error('Error fetching html:', e.message);
  }
}

fetchSource();

