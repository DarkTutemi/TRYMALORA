import fs from 'fs';

const API_KEY = 'pubkey-3x1eB0909Qi06207M23U35iD5PI739';
const STORE_URL = '8sheep.myshopify.com';

async function fetchReviews(productId, page = 1) {
  const url = `https://stamped.io/api/widget/reviews?productId=${productId}&apiKey=${API_KEY}&storeUrl=${STORE_URL}&page=${page}&take=50`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  return await res.json();
}

async function run() {
  const data = await fetchReviews('1825437253732', 1);
  console.log('Total reviews reported:', data.total);
  console.log('Rating:', data.rating);
  console.log('Data items:', data.data?.length);

  if (data.data && data.data.length > 0) {
    const filtered = data.data.filter(r => r.reviewRating >= 3);
    console.log('Filtered (>= 3 stars) count:', filtered.length);
    console.log('Sample review:', JSON.stringify({
      author: filtered[0].author,
      rating: filtered[0].reviewRating,
      title: filtered[0].reviewTitle,
      message: filtered[0].reviewMessage?.slice(0, 120),
      date: filtered[0].reviewDate,
      verified: filtered[0].reviewVerifiedType
    }, null, 2));
  }
}

run().catch(console.error);
