import fs from 'fs';

async function fetchSource() {
  const url = 'https://amblora.com/products/ear-cleaner.json';
  console.log('Fetching', url);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      fs.writeFileSync('scripts/amblora_ear_cleaner.json', JSON.stringify(data, null, 2), 'utf8');
      console.log('Saved product JSON. Title:', data.product?.title);
      console.log('Variants count:', data.product?.variants?.length);
      console.log('Images count:', data.product?.images?.length);
    }
  } catch(e) {
    console.error('Error fetching json:', e.message);
  }

  const htmlUrl = 'https://amblora.com/products/ear-cleaner';
  console.log('Fetching HTML', htmlUrl);
  try {
    const res = await fetch(htmlUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('HTML Status:', res.status);
    if (res.ok) {
      const html = await res.text();
      fs.writeFileSync('scripts/amblora_ear_cleaner.html', html, 'utf8');
      console.log('Saved product HTML. Size:', html.length);
    }
  } catch(e) {
    console.error('Error fetching html:', e.message);
  }
}

fetchSource();

