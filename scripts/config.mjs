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

export function getCliToken(shopDomain = SHOP) {
  try {
    const configPath = 'C:/Users/Admin/AppData/Roaming/shopify-cli-kit-nodejs/Config/config.json';
    if (fs.existsSync(configPath)) {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const session = typeof data.sessionStore === 'string' ? JSON.parse(data.sessionStore) : data.sessionStore;
      const accounts = session['accounts.shopify.com'];
      for (const accountId in accounts) {
        const apps = accounts[accountId]?.applications || {};
        for (const appKey in apps) {
          if (appKey.startsWith(shopDomain) && apps[appKey].accessToken) {
            return apps[appKey].accessToken;
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export async function getAccessToken() {
  if (process.env.SHOPIFY_ACCESS_TOKEN) {
    return process.env.SHOPIFY_ACCESS_TOKEN;
  }
  const cliToken = getCliToken();
  if (cliToken) {
    return cliToken;
  }
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Missing SHOPIFY_CLIENT_ID or SHOPIFY_CLIENT_SECRET or CLI session');
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

export async function adminGraphql(query, variables = {}) {
  const token = await getAccessToken();
  const url = `https://${SHOP}/admin/api/${API_VERSION}/graphql.json`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  if (json.errors) {
    console.error('GraphQL Errors:', JSON.stringify(json.errors, null, 2));
    throw new Error(`GraphQL failed: ${json.errors[0]?.message || 'Unknown error'}`);
  }
  return json.data;
}

