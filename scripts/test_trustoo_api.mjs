import fs from 'fs';

async function testTrustoo() {
  const urls = [
    'https://api.trustoo.io/front/comment/get_list?shop_id=68196728915&product_id=15438808154195&page=1&limit=100',
    'https://api.trustoo.io/pro/comment/get_list?shop_id=68196728915&product_id=15438808154195&page=1&limit=100',
    'https://api.trustoo.io/v1/comment/list?shop_id=68196728915&product_id=15438808154195&page=1&limit=100',
    'https://api-service.trustoo.io/front/comment/get_list?shop_domain=aneedfamily.com&product_id=15438808154195&page=1&limit=100'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      console.log(url, res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Got data:', data.code, data.data ? Object.keys(data.data) : null);
      }
    } catch(e) {
      console.log(url, e.message);
    }
  }
}

testTrustoo();

