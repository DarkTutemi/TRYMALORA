import { adminGraphql } from './config.mjs';

async function main() {
  const mutation = `
    mutation themeDuplicate($id: ID!) {
      themeDuplicate(id: $id, name: "TRYMALORA - LIVE BACKUP BEFORE MIX_MATCH") {
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
  const res = await adminGraphql(mutation, { id: 'gid://shopify/OnlineStoreTheme/197111513459' });
  console.log(JSON.stringify(res, null, 2));
}

main();

