import { getCliToken } from './config.mjs';

async function main() {
  const token = getCliToken();
  const res = await fetch('https://ikwh1h-fx.myshopify.com/admin/api/2026-10/graphql.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({
      query: `
        query {
          productByHandle(handle: "car-metal-rust-repair-paste") {
            id
            options {
              id
              name
              optionValues {
                id
                name
              }
            }
          }
        }
      `
    })
  });
  console.log(JSON.stringify(await res.json(), null, 2));
}

main().catch(console.error);

