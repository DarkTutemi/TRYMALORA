async function main() {
  const url = 'https://api.trustoo.io/api/v1/reviews/get_product_reviews?shop_id=68196728915&product_id=15438808154195&page=1&limit=50';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Response code:', data.code);
  console.log('Data keys:', data.data ? Object.keys(data.data) : null);
  if (data.data?.list) {
    console.log(`Reviews in list: ${data.data.list.length}, total: ${data.data.page?.count}`);
  }
}

main();

