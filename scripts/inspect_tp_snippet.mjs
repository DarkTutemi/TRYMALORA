import fs from 'fs';

const html = fs.readFileSync('C:/Users/Admin/Desktop/TRYMALORA/scripts/amblora_ear_cleaner.html', 'utf8');
const idx = html.indexOf('trustpilot-stars');
if (idx !== -1) {
  console.log(html.slice(idx - 200, idx + 1200));
}

