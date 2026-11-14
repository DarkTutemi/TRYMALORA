import fs from 'fs';

const html = fs.readFileSync('scripts/target_gnome.html', 'utf8');

// Check Judge.me
const jdgmMatch = html.match(/class=["'][^"']*jdgm[^"']*["']/gi);
console.log('Judge.me matches:', jdgmMatch ? jdgmMatch.length : 0);

// Check Loox
const looxMatch = html.match(/class=["'][^"']*loox[^"']*["']/gi);
console.log('Loox matches:', looxMatch ? looxMatch.length : 0);

// Check Spr
const sprMatch = html.match(/id=["']shopify-product-reviews["']/gi);
console.log('SPR matches:', sprMatch ? sprMatch.length : 0);

// Let's search for customer names, review bodies, comments
const comments = [...html.matchAll(/<div[^>]*class=["'][^"']*(?:review|comment|testimonial)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi)];
console.log('Review divs:', comments.length);
if (comments.length > 0) {
  console.log('First review sample:', comments[0][1].substring(0, 300));
}
