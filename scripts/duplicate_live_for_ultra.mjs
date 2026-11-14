import { adminGraphql, SHOP } from './config.mjs';

async function duplicateLiveTheme() {
  const liveThemeId = '197144805747';
  const newName = 'ULTRA OVERNIGHT — PREMIUM FEMININE V1 — DRAFT';

  console.log(`Duplicating Live Theme ${liveThemeId} into "${newName}" on ${SHOP}...`);

  const mutation = `
    mutation duplicateTheme($id: ID!, $name: String!) {
      themeDuplicate(id: $id, name: $name) {
        newTheme {
          id
          name
          role
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await adminGraphql(mutation, {
    id: `gid://shopify/OnlineStoreTheme/${liveThemeId}`,
    name: newName
  });

  const payload = data.themeDuplicate;
  if (payload.userErrors && payload.userErrors.length > 0) {
    console.error('Errors duplicating theme:', payload.userErrors);
    process.exit(1);
  }

  const newTheme = payload.newTheme;
  const rawId = newTheme.id.split('/').pop();
  console.log('\n======================================================');
  console.log(' SUCCESS! NEW UNPUBLISHED DRAFT THEME CREATED (EXACT DUPLICATE OF LIVE)');
  console.log(`Theme GID:  ${newTheme.id}`);
  console.log(`Theme ID:   ${rawId}`);
  console.log(`Theme Name: ${newTheme.name}`);
  console.log(`Role:       ${newTheme.role}`);
  console.log(`Preview:    https://${SHOP}/?preview_theme_id=${rawId}`);
  console.log('======================================================\n');
}

duplicateLiveTheme().catch(console.error);

