import fs from 'fs';

const html = fs.readFileSync('scripts/aneedfamily_page.html', 'utf8');

const regex = /https?:\/\/[a-zA-Z0-9.-]*trustoo[a-zA-Z0-9.-]*\/[^\s"'<>]*/g;
const matches = html.match(regex) || [];
console.log('Trustoo links:', [...new Set(matches)]);

