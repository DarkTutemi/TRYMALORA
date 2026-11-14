import { adminGraphql } from './config.mjs';

async function main() {
  const res = await adminGraphql(`{
    sellingPlanGroups(first: 10) {
      nodes {
        id
        name
        merchantCode
        sellingPlans(first: 5) {
          nodes {
            id
            name
            description
            category
          }
        }
      }
    }
  }`);
  console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);

