import fs from 'fs';

const pdpHtml = fs.readFileSync('scripts/8sheep_pdp_sleepylotion.html', 'utf8');

const sectionIds = [...pdpHtml.matchAll(/id="shopify-section-([^"]+)"/g)].map(m => m[1]);
console.log('PDP section IDs:', sectionIds);

// Check CSS files loaded on PDP
const cdnCss = [...new Set([...pdpHtml.matchAll(/href="([^"]+\.css[^"]*)"/g)].map(m => m[1]))];
console.log('PDP CSS URLs:', cdnCss.filter(u => u.includes('8sheep') || u.includes('cdn.shop')));

// Check JS files loaded on PDP
const cdnJs = [...new Set([...pdpHtml.matchAll(/src="([^"]+\.js[^"]*)"/g)].map(m => m[1]))];
console.log('PDP JS URLs:', cdnJs.filter(u => u.includes('8sheep') || u.includes('cdn.shop')));

// Check fonts
const fonts = [...pdpHtml.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(m => m[1]);
console.log('Fonts declarations sample:', fonts.slice(0, 3));
