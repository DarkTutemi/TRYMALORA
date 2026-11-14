async function test() {
  const url = 'https://shfc473g83902f70-103245414771.shopifypreview.com/products_preview?preview_key=4413ea37d1354694083abb700c78f1e9&preview_theme_id=197144805747';
  const res = await fetch(url);
  const text = await res.text();
  const sections = text.match(/id="shopify-section-[^"]+"/g) || [];
  console.log('Sections found:', sections);
  const h1 = text.match(/<h1[^>]*>(.*?)<\/h1>/is)?.[1]?.trim();
  console.log('H1:', h1);
  console.log('Includes Trustpilot:', text.includes('Trustpilot'));
  console.log('Includes What in the Box:', text.includes("What's in the Box"));
  console.log('Includes 3-Step Effortless Setup:', text.includes('3-Step Effortless Setup'));
  console.log('Includes Frequently Asked Questions:', text.includes('Frequently Asked Questions'));
}

test();

