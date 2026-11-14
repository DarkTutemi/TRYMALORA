import fs from 'fs';
import { exec } from 'child_process';

const CONFIG_PATH = 'C:/Users/Admin/AppData/Roaming/shopify-cli-kit-nodejs/Config/config.json';
const CLI_CLIENT_ID = 'fbdb2649-e327-4907-8f67-908d24cfd7e3';
const ADMIN_AUDIENCE = '7ee65a63608843c577db8b23c4d7316ea0a01bd2f7594f8a9c06ea668c1b775c';
const STORE = 'ikwh1h-fx.myshopify.com';

const SCOPES = [
  'openid',
  'https://api.shopify.com/auth/shop.admin.graphql',
  'https://api.shopify.com/auth/partners.app.cli.access',
  'https://api.shopify.com/auth/destinations.readonly',
  'https://api.shopify.com/auth/partners.collaborator-relationships.readonly',
  'https://api.shopify.com/auth/shop.storefront-renderer.devtools',
  'https://api.shopify.com/auth/shop.admin.themes',
  'https://api.shopify.com/auth/organization.store-management',
  'https://api.shopify.com/auth/organization.apps.manage',
  'https://api.shopify.com/auth/organization.on-demand-user-access'
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch (e) {
    return {};
  }
}

async function exchangeToken(identityToken, audience, destination = null) {
  const body = {
    grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
    requested_token_type: 'urn:ietf:params:oauth:token-type:access_token',
    subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
    client_id: CLI_CLIENT_ID,
    audience: audience,
    scope: '',
    subject_token: identityToken
  };
  if (destination) {
    body.destination = destination;
  }
  const res = await fetch('https://accounts.shopify.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body)
  });
  return await res.json();
}

async function main() {
  console.log('Initiating device authorization with Shopify...');
  const devAuthRes = await fetch('https://accounts.shopify.com/oauth/device_authorization', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLI_CLIENT_ID,
      scope: SCOPES.join(' ')
    })
  });

  const devAuth = await devAuthRes.json();
  if (!devAuth.device_code) {
    console.error('Failed to get device code:', devAuth);
    process.exit(1);
  }

  console.log('================================================================');
  console.log(`DEVICE AUTH URL: ${devAuth.verification_uri_complete}`);
  console.log(`USER CODE:       ${devAuth.user_code}`);
  console.log('================================================================');
  
  exec(`start "" "${devAuth.verification_uri_complete}"`, (err) => {
    if (err) console.error('Failed to auto-open browser:', err.message);
  });

  const interval = (devAuth.interval || 5) * 1000;
  let tokenData = null;

  for (let i = 0; i < 60; i++) {
    await sleep(interval);
    const tokenRes = await fetch('https://accounts.shopify.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        device_code: devAuth.device_code,
        client_id: CLI_CLIENT_ID
      })
    });
    const json = await tokenRes.json();
    if (json.access_token) {
      tokenData = json;
      console.log('\n[SUCCESS] Authorized by user!');
      break;
    } else if (json.error === 'authorization_pending') {
      process.stdout.write('.');
    } else {
      console.log('\nPolling response:', json);
      if (json.error !== 'slow_down') {
        break;
      }
    }
  }

  if (!tokenData) {
    console.error('\nAuthorization timed out or failed.');
    process.exit(1);
  }

  const jwt = parseJwt(tokenData.id_token);
  const userId = jwt.sub || '49b2bbc4-0277-4eeb-9c56-b1847b3242b8';
  const alias = jwt.email || 'mcroycervantes@gmail.com';
  console.log(`Authenticated as: ${alias} (${userId})`);

  console.log('Performing Admin token exchange for store:', STORE);
  const storeExchange = await exchangeToken(tokenData.access_token, ADMIN_AUDIENCE, `https://${STORE}/admin`);
  if (!storeExchange.access_token) {
    console.error('Store token exchange failed:', storeExchange);
    process.exit(1);
  }

  const appAudiences = [
    '271e16d403dfa18082ffb3d197bd2b5f4479c3fc32736d69296829cbb28d41a6',
    'ee139b3d-5861-4d45-b387-1bc3ada7811c',
    '32ff8ee5-82b8-4d93-9f8a-c6997cefb7dc',
    '7ee65a63608843c577db8b23c4d7316ea0a01bd2f7594f8a9c06ea668c1b775c'
  ];

  const applications = {};
  applications[`${STORE}-${ADMIN_AUDIENCE}`] = {
    accessToken: storeExchange.access_token,
    expiresAt: new Date(Date.now() + (storeExchange.expires_in || 86400) * 1000).toISOString(),
    scopes: ['*']
  };

  for (const aud of appAudiences) {
    try {
      const ex = await exchangeToken(tokenData.access_token, aud);
      if (ex.access_token) {
        applications[aud] = {
          accessToken: ex.access_token,
          expiresAt: new Date(Date.now() + (ex.expires_in || 86400) * 1000).toISOString(),
          scopes: ['*']
        };
      }
    } catch (e) {}
  }

  let configData = {};
  if (fs.existsSync(CONFIG_PATH)) {
    configData = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  }
  const sessionStore = typeof configData.sessionStore === 'string' 
    ? JSON.parse(configData.sessionStore) 
    : (configData.sessionStore || {});

  if (!sessionStore['accounts.shopify.com']) {
    sessionStore['accounts.shopify.com'] = {};
  }

  sessionStore['accounts.shopify.com'][userId] = {
    identity: {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      scopes: tokenData.scope.split(' '),
      userId: userId,
      alias: alias
    },
    applications: applications
  };

  configData.currentSessionId = userId;
  configData.sessionStore = JSON.stringify(sessionStore);
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(configData, null, 2), 'utf8');
  console.log('[OK] CLI tokens saved!');
}

main().catch(console.error);

