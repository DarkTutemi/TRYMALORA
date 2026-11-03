import fs from 'fs';
import path from 'path';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

// Load environment variables from .env if present
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  }
}

export const SHOP = process.env.SHOPIFY_STORE || process.env.SHOP_DOMAIN || 'trymalora.myshopify.com';
export const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || '';
export const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_API_SECRET || '';
export const THEME_ID = process.env.SHOPIFY_THEME_ID || process.env.THEME_ID || '';
export const API_VERSION = process.env.SHOPIFY_API_VERSION || '2026-10';

export async function getAccessToken() {
  if (process.env.SHOPIFY_ACCESS_TOKEN) {
    return process.env.SHOPIFY_ACCESS_TOKEN;
  }
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Missing SHOPIFY_CLIENT_ID or SHOPIFY_CLIENT_SECRET in .env');
  }
  const tRes = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });
  const data = await tRes.json();
  if (!data.access_token) {
    throw new Error(`Failed to get access token from ${SHOP}: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}
