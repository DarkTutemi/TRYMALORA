import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function testDiscount() {
  const token = await getAccessToken();
  console.log('Testing REST discounts on', SHOP);
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/price_rules.json`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('REST price_rules status:', res.status);
  const text = await res.text();
  console.log('REST response:', text);
}

testDiscount();

