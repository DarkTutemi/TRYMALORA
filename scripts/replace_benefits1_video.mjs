import fs from 'fs';
import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

let html = fs.readFileSync('sections/ceruline-us-benefits-1.liquid', 'utf8');
html = html.replace('<video autoplay loop muted playsinline', '<video id="CerulineBenefitsVideo" autoplay loop muted playsinline controls');
if (!html.includes('CerulineBenefitsVideo')) {
  html = html.replace('<video ', '<video id="CerulineBenefitsVideo" controls ');
}
html += '\n<script>document.addEventListener("DOMContentLoaded",function(){var v=document.getElementById("CerulineBenefitsVideo");if(v){v.muted=true;v.play().catch(function(){});}});</script>';
fs.writeFileSync('sections/ceruline-us-benefits-1.liquid', html);

const token = await getAccessToken();
const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235/assets.json`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
  body: JSON.stringify({ asset: { key: 'sections/ceruline-us-benefits-1.liquid', value: html } })
});
console.log('ceruline-us-benefits-1.liquid ->', res.status);
