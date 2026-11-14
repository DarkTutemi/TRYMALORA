import fs from 'fs';

const html = fs.readFileSync('scripts/eyvelle_steam_therapy.html', 'utf8');
const formMatch = html.match(/<form[^>]*action="\/cart\/add"[^>]*>([\s\S]*?)<\/form>/i);
if (formMatch) {
  const formHtml = formMatch[1];
  // Find all buttons, inputs, radios
  const inputs = [...formHtml.matchAll(/<input[^>]+>/gi)].map(m => m[0]);
  console.log('Inputs count:', inputs.length);
  inputs.forEach(inp => console.log('  Input:', inp));

  const buttons = [...formHtml.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  console.log('Buttons:', buttons);

  // Look for text around variants or quantities
  const text = formHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log('\nForm text excerpt:', text.slice(0, 1000));
}
