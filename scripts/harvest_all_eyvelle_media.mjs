import fs from 'fs';

const html = fs.readFileSync('scripts/eyvelle_steam_therapy.html', 'utf8');

// Find all image tags
const imgTags = [...html.matchAll(/<img[^>]+src="([^">]+)"/gi)].map(m => m[1]);
// Find all data-src or data-original
const dataSrcs = [...html.matchAll(/data-[a-z0-9-_]*src="([^">]+)"/gi)].map(m => m[1]);
// Find all video tags and sources
const videos = [...html.matchAll(/<video[^>]*>([\s\S]*?)<\/video>/gi)].map(m => m[1]);
const videoSrcs = [...html.matchAll(/<source[^>]+src="([^">]+)"/gi)].map(m => m[1]);
const directVideoUrls = [...html.matchAll(/(https?:\/\/[^"'\s]+\.(mp4|webm|mov))/gi)].map(m => m[1]);
// Find all gifs
const gifUrls = [...html.matchAll(/(https?:\/\/[^"'\s]+\.gif)/gi)].map(m => m[1]);
// Find all webp animations or webp files
const webpUrls = [...html.matchAll(/(https?:\/\/[^"'\s]+\.webp)/gi)].map(m => m[1]);

console.log('--- HARVEST RESULTS ---');
console.log('Video sources:', videoSrcs);
console.log('Direct video URLs:', directVideoUrls);
console.log('GIF URLs:', gifUrls);
console.log('Webp URLs count:', webpUrls.length);

const allMedia = [...new Set([
  ...imgTags,
  ...dataSrcs,
  ...videoSrcs,
  ...directVideoUrls,
  ...gifUrls,
  ...webpUrls
])].filter(u => u.startsWith('http') && !u.includes('tracking') && !u.includes('analytics') && !u.includes('facebook') && !u.includes('pixel'));

console.log('\nTotal unique media URLs:', allMedia.length);
allMedia.forEach((m, idx) => console.log(`[Media #${idx+1}]`, m));

