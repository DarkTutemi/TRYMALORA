import { getAccessToken, SHOP } from './config.mjs';

async function testStorefrontDiscount() {
  console.log('Testing discount endpoint on', SHOP);
  const res = await fetch(`https://${SHOP}/discount/TEST`);
  console.log('Status:', res.status, res.headers.get('location'));
}

testStorefrontDiscount();

