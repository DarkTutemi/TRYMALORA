import fs from 'fs';

const html = fs.readFileSync('scripts/eyvelle_steam_therapy.html', 'utf8');
const idx = html.indexOf('scm-reviews-importer');
const scriptStart = html.lastIndexOf('<script', idx);
const scriptEnd = html.indexOf('</script>', scriptStart);

const scriptContent = html.slice(scriptStart, scriptEnd);
console.log('Script length:', scriptContent.length);
fs.writeFileSync('scripts/eyvelle_embedded_reviews_raw.txt', scriptContent, 'utf8');
console.log('Saved raw script to scripts/eyvelle_embedded_reviews_raw.txt');

