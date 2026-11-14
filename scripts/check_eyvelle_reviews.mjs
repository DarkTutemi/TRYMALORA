import fs from 'fs';

async function checkReviews() {
  const prodId = '9394778505459';
  console.log('Testing Loox API for', prodId);
  try {
    const looxUrl = `https://loox.io/widget/VJg_r5pP9b/reviews?product_id=${prodId}&page=1`;
    const res = await fetch(looxUrl);
    console.log('Loox test status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Loox data keys:', Object.keys(data));
      console.log('Reviews count:', data.reviews?.length);
      fs.writeFileSync('scripts/eyvelle_loox_reviews.json', JSON.stringify(data, null, 2));
    }
  } catch(e) {
    console.log('Loox error:', e.message);
  }

  // Also check HTML for any embedded review texts
  const html = fs.readFileSync('scripts/eyvelle_steam_therapy.html', 'utf8');
  const reviewQuotes = [...html.matchAll(/“([^”"]+)”/g)].map(m => m[1]);
  console.log('Quotes in HTML count:', reviewQuotes.length);
  reviewQuotes.slice(0, 5).forEach((q, i) => console.log(` Quote #${i+1}:`, q));
}

checkReviews();

