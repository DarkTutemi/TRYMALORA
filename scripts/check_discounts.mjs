import { adminGraphql } from './config.mjs';

async function checkDiscounts() {
  const query = `
    query {
      discountNodes(first: 20) {
        edges {
          node {
            id
            discount {
              ... on DiscountAutomaticApp {
                title
                status
              }
              ... on DiscountAutomaticBasic {
                title
                status
                customerGets {
                  value {
                    ... on DiscountPercentage {
                      percentage
                    }
                  }
                }
              }
              ... on DiscountAutomaticBxgy {
                title
                status
              }
              ... on DiscountCodeBasic {
                title
                status
              }
            }
          }
        }
      }
    }
  `;
  const res = await adminGraphql(query);
  console.log(JSON.stringify(res, null, 2));
}

checkDiscounts();

