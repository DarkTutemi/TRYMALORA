async function testTrackOrder() {
  const url = 'https://trymalora.com/pages/track-order';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Text length:', text.length);
  if (text.includes('404') || text.includes('Page not found')) {
    console.log('ERROR: 404 Page not found detected!');
  }
  // Check which sections are in the response
  console.log('Contains uo-track-box:', text.includes('uo-track-box'));
  console.log('Contains 17track or tracking:', text.includes('tracking') || text.includes('Track'));
  
  // Find title
  const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
  console.log('Title:', titleMatch ? titleMatch[1] : null);

  // Check if there are JS errors or broken links
  const formMatch = text.match(/<form[^>]*id="uoTrackLookupForm"[^>]*>/i);
  console.log('Form found:', !!formMatch);
}
testTrackOrder();

