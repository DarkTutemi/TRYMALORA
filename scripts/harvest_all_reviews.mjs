import fs from 'fs';

const API_KEY = 'pubkey-3x1eB0909Qi06207M23U35iD5PI739';
const STORE_URL = '8sheep.myshopify.com';

function rebrand(str) {
  if (!str) return '';
  return str
    .replace(/8\s*Sheep\s*Organics/gi, 'Malora Organics')
    .replace(/8\s*Sheep/gi, 'Malora')
    .replace(/8sheep\.com/gi, 'trymalora.com');
}

async function fetchReviews(productId) {
  const url = `https://stamped.io/api/widget/reviews?productId=${productId}&apiKey=${API_KEY}&storeUrl=${STORE_URL}&page=1&take=50`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) return null;
  return await res.json();
}

async function run() {
  const catalog = JSON.parse(fs.readFileSync('scripts/malora_catalog_prepared.json', 'utf8'));
  const reviewsByHandle = {};

  for (const item of catalog) {
    console.log(`Fetching reviews for ${item.title} (${item.original_id})...`);
    try {
      const data = await fetchReviews(item.original_id);
      if (data && data.data && data.data.length > 0) {
        // Strictly filter >= 3 stars (exclude 1-star and 2-star)
        const filtered = data.data
          .filter(r => Number(r.reviewRating) >= 3)
          .map(r => ({
            author: r.author || 'Verified Customer',
            rating: Number(r.reviewRating),
            title: rebrand(r.reviewTitle || ''),
            message: rebrand(r.reviewMessage || ''),
            date: r.reviewDate || 'Recently',
            verified: r.reviewVerifiedType > 0,
            country: r.location || 'United States'
          }));

        // Calculate distribution for >= 3 stars
        const counts = { 5: 0, 4: 0, 3: 0 };
        let sum = 0;
        for (const r of filtered) {
          if (counts[r.rating] !== undefined) counts[r.rating]++;
          sum += r.rating;
        }
        const avg = filtered.length > 0 ? (sum / filtered.length).toFixed(1) : '5.0';

        reviewsByHandle[item.handle] = {
          total: data.total || filtered.length,
          average: avg,
          counts,
          reviews: filtered.slice(0, 25)
        };
        console.log(`  -> Saved ${filtered.length} reviews (>=3 stars), avg: ${avg}`);
      } else {
        console.log(`  -> No reviews found, using fallback.`);
      }
    } catch (e) {
      console.error(`  -> Error:`, e.message);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  fs.writeFileSync('assets/malora-reviews.json', JSON.stringify(reviewsByHandle));
  console.log('=== SAVED ALL REVIEWS (>= 3 STARS) TO assets/malora-reviews.json ===');
}

run().catch(console.error);
