import { adminGraphql } from './config.mjs';

async function main() {
  const res = await adminGraphql('{ productByHandle(handle: "metallic-silver-anti-rust-renovation-coating") { id templateSuffix } }');
  console.log('Product templateSuffix:', res.productByHandle);
}

main().catch(console.error);

