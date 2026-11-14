import fs from 'fs';

const html = fs.readFileSync('scripts/amblora_ear_cleaner.html', 'utf8');
const sub = html.slice(72688 - 50, 72688 + 5000);
console.log(sub.slice(0, 3000));

