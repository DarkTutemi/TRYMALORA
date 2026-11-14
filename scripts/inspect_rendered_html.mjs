async function main() {
  const res = await fetch('https://trymalora.com/products/eyvelle-steam-therapy');
  const html = await res.text();
  const matches = [...html.matchAll(/zv-eye-bundle-card[\s\S]*?data-variant-id="([^"]*)"/g)];
  console.log('Matches count:', matches.length);
  matches.forEach((m, idx) => console.log(`Card ${idx+1} variant ID:`, m[1]));
  const upsellMatch = html.match(/id="zvEyeUpsellCheck"[\s\S]*?data-variant-id="([^"]*)"/);
  console.log('Upsell variant:', upsellMatch ? upsellMatch[1] : 'NOT FOUND');
}
main();

