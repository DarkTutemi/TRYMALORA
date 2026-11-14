import fs from 'fs';

async function fetchAll() {
  let allReviews = [];
  let page = 1;
  const limit = 50;

  while (true) {
    console.log(`Fetching page ${page}...`);
    const url = `https://api.trustoo.io/api/v1/reviews/get_product_reviews?shop_id=68196728915&product_id=15438808154195&page=${page}&limit=${limit}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const json = await res.json();
    if (!json.data?.list || json.data.list.length === 0) break;
    allReviews.push(...json.data.list);
    console.log(`Page ${page}: got ${json.data.list.length} reviews (total so far: ${allReviews.length})`);
    if (allReviews.length >= (json.data.page?.count || 125)) break;
    page++;
  }

  console.log(`\nSuccessfully downloaded all ${allReviews.length} reviews!`);
  fs.writeFileSync('scripts/all_125_reviews.json', JSON.stringify(allReviews, null, 2), 'utf8');

  // Count photos
  const withPhotos = allReviews.filter(r => r.resources && r.resources.length > 0);
  console.log(`Reviews with photos: ${withPhotos.length}`);
}

fetchAll().catch(console.error);

