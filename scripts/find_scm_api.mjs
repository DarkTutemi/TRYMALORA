import fs from 'fs';

const html = fs.readFileSync('scripts/eyvelle_steam_therapy.html', 'utf8');
const scmUrls = [...html.matchAll(/(https?:\/\/[^"'\s]+scm[^"'\s]+)/gi)].map(m => m[1]);
console.log('SCM urls:', scmUrls);
const cdnUrls = [...html.matchAll(/(https?:\/\/[^"'\s]+smart[^"'\s]+)/gi)].map(m => m[1]);
console.log('Smart urls:', cdnUrls);
const appUrls = [...html.matchAll(/(https?:\/\/[^"'\s]+ali[^"'\s]+)/gi)].map(m => m[1]);
console.log('Ali urls:', appUrls);

