import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('scripts/amblora_ear_cleaner.html', 'utf-8');
const $ = cheerio.load(html);

console.log('Page Title:', $('title').text());
$('section, .shopify-section').each((i, el) => {
  const id = $(el).attr('id') || '';
  const cls = $(el).attr('class') || '';
  const h = $(el).find('h1, h2, h3').map((_, h) => $(h).text().trim()).get();
  if (h.length > 0) {
    console.log(`Section #${i} [id=${id}] [class=${cls.substring(0, 40)}]:`);
    console.log('   Headings:', h.slice(0, 3).join(' | '));
  }
});

