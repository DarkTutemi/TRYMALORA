import { adminGraphql } from './config.mjs';

async function main() {
  const q = `{
    __type(name: "WebPixel") {
      name
      fields {
        name
        type { name kind ofType { name } }
      }
    }
  }`;
  const res = await adminGraphql(q);
  console.log('WebPixel fields:', JSON.stringify(res.__type.fields, null, 2));
}

main().catch(console.error);

