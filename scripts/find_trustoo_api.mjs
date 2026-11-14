import fs from 'fs';

const html = fs.readFileSync('scripts/aneedfamily_page.html', 'utf8');

// Find all occurrences of API endpoints or trustoo
const matches = [];
const lines = html.split('\n');
lines.forEach(line => {
  if (line.includes('trustoo') || line.includes('vstar')) {
    if (line.includes('http') || line.includes('/api/')) {
      matches.push(line.trim());
    }
  }
});

console.log('Matches found:', matches.length);
matches.slice(0, 10).forEach(m => console.log(m.slice(0, 150)));

