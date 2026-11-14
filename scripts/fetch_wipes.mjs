import fs from 'fs';

async function fetchWipes() {
  const url = 'https://amblora.com/products/ear-finger-wipes.json';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  console.log('Status:', res.status);
  if (res.ok) {
    const data = await res.json();
    fs.writeFileSync('scripts/amblora_ear_finger_wipes.json', JSON.stringify(data, null, 2), 'utf8');
    console.log('Title:', data.product?.title);
    console.log('Price:', data.product?.variants?.[0]?.price);
    console.log('Compare at price:', data.product?.variants?.[0]?.compare_at_price);
    console.log('Images:', data.product?.images?.map(i => i.src));
  }
}

fetchWipes();

