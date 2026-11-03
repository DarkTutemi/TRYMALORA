import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function createDraftTheme() {
  const themeName = process.argv[2] || 'TRYMALORA - IMMERSIVE SHOWROOM V4.0 - DRAFT';
  console.log(`Creating new theme "${themeName}" on ${SHOP}...`);
  const token = await getAccessToken();

  // Create new blank theme or duplicate live theme
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      theme: {
        name: themeName,
        role: 'unpublished'
      }
    })
  });

  const data = await res.json();
  if (data.theme) {
    console.log(`\n======================================================`);
    console.log(` SUCCESS! NEW UNPUBLISHED DRAFT THEME CREATED`);
    console.log(`Theme ID:   ${data.theme.id}`);
    console.log(`Theme Name: ${data.theme.name}`);
    console.log(`Role:       ${data.theme.role}`);
    console.log(`Preview:    https://${SHOP}/?preview_theme_id=${data.theme.id}`);
    console.log(`======================================================`);
    console.log(`\nNext step: update your .env with SHOPIFY_THEME_ID=${data.theme.id}`);
  } else {
    console.error('Failed to create theme:', data);
  }
}

createDraftTheme().catch(console.error);
