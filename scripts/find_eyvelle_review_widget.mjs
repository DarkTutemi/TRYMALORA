import fs from 'fs';

const html = fs.readFileSync('scripts/eyvelle_steam_therapy.html', 'utf8');
const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/gi)].map(m => m[1]);

console.log('Total scripts found:', scripts.length);
scripts.forEach(s => {
  if (/review|loox|judge|yotpo|stamped|okendo|trust|alireviews|fera/i.test(s)) {
    console.log('Review Script:', s);
  }
});

// Also check for review iframe or widgets
const widgets = [...html.matchAll(/class="([^"]*review[^"]*)"/gi)].map(m => m[1]);
console.log('Review classes:', [...new Set(widgets)]);

// Check for yotpo or loox app id
const yotpoApp = html.match(/yotpo\.com\/([^\/]+)/);
console.log('Yotpo:', yotpoApp ? yotpoApp[1] : 'none');
const looxApp = html.match(/loox\.io\/widget\/([^\/]+)/);
console.log('Loox App ID:', looxApp ? looxApp[1] : 'none');

