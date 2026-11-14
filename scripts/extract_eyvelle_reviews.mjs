import fs from 'fs';

const html = fs.readFileSync('scripts/eyvelle_steam_therapy.html', 'utf8');

// Look for scm reviews data embedded
const scmBlocks = [...html.matchAll(/scm-[^"'\s>]+/gi)].map(m => m[0]);
console.log('SCM classes:', [...new Set(scmBlocks)]);

// Look for any JSON-LD reviews
const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map(m => m[1]);
console.log('JSON-LD blocks:', jsonLd.length);
jsonLd.forEach((b, i) => {
  if (b.includes('Review') || b.includes('review') || b.includes('aggregateRating')) {
    console.log(`JSON-LD Review #${i+1}:`, b.slice(0, 500));
  }
});

// Search for any customer names
const names = [...html.matchAll(/(Sarah|Emily|Michael|David|Jessica|Amanda|Jennifer|James|Robert|John|Dr\.)\s+[A-Z]\.?/g)].map(m => m[0]);
console.log('Customer names found:', [...new Set(names)]);

