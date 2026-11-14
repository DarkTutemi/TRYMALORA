import fs from 'fs';

const html = fs.readFileSync('scripts/eyvelle_steam_therapy.html', 'utf8');
const idx = html.indexOf('scm-reviews-rate');
if (idx !== -1) {
  console.log('Surrounding HTML around scm-reviews-rate:');
  console.log(html.slice(Math.max(0, idx - 400), idx + 800));
}

