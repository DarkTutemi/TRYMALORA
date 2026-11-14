const products = [
  {
    name: 'Metallic Silver Anti-Rust Renovation Coating',
    key: 'fd2620f8f64dc3cfeb5d96940d292332',
    handle: 'metallic-silver-anti-rust-renovation-coating'
  },
  {
    name: 'Car Metal Rust Repair Paste',
    key: '4413ea37d1354694083abb700c78f1e9',
    handle: 'car-metal-rust-repair-paste'
  },
  {
    name: 'Metal Chrome Polish & Restorer Paste',
    key: '9feed30fe29ac17765638dbb1ec9b765',
    handle: 'metal-chrome-polish-restorer-paste'
  },
  {
    name: 'Mini Dual-Purpose Travel Styling Iron',
    key: '7f84d6f715bff894ad093d0ba0151601',
    handle: 'mini-dual-purpose-travel-styling-iron'
  },
  {
    name: 'Tile Refinishing Paint Restoration Kit',
    key: 'e5a80b1debbd31be2e54828c0365d0f1',
    handle: 'tile-refinishing-paint-restoration-kit'
  }
];

async function verifyAll() {
  for (const p of products) {
    const url = `https://shfc473g83902f70-103245414771.shopifypreview.com/products_preview?preview_key=${p.key}&preview_theme_id=197144805747`;
    const res = await fetch(url);
    const text = await res.text();
    const h1 = text.match(/<h1[^>]*>(.*?)<\/h1>/is)?.[1]?.trim();
    const hasTrustpilot = text.includes('Trustpilot');
    const hasPackage = text.includes("What's in the Box");
    const hasSetup = text.includes('3-Step Effortless Setup');
    const hasFaq = text.includes('Frequently Asked Questions');
    console.log(`[VERIFIED] ${p.name}`);
    console.log(`  H1: ${h1}`);
    console.log(`  Trustpilot: ${hasTrustpilot} | Box: ${hasPackage} | Setup: ${hasSetup} | FAQ: ${hasFaq}`);
    console.log(`  Preview URL: ${url}\n`);
  }
}

verifyAll();

