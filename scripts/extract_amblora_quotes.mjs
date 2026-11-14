import fs from 'fs';

const html = fs.readFileSync('C:/Users/Admin/Desktop/TRYMALORA/scripts/amblora_ear_cleaner.html', 'utf8');

// Search for quote or customer names
const matches = html.match(/class="[^"]*(review|testimonial|quote)[^"]*"[\s\S]*?<\/(div|section|blockquote)>/gi) || [];
console.log('Matches found:', matches.length);
matches.slice(0, 5).forEach((m, i) => console.log(`[${i}]`, m.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)));

