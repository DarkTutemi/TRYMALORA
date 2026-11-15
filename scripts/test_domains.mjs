async function testShopifyDomain() {
  const urls = [
    'https://ikwh1h-fx.myshopify.com/pages/track-order',
    'https://trymalora.com/pages/track-order',
    'https://trymalora.com/pages/about-us',
    'https://ikwh1h-fx.myshopify.com/pages/about-us'
  ];
  for (const url of urls) {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    console.log(url, 'Status:', res.status);
    const text = await res.text();
    const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
    console.log('Title:', titleMatch ? titleMatch[1].trim() : 'No title');
  }
}
testShopifyDomain();

