import { adminGraphql, SHOP } from './config.mjs';

async function main() {
  // Check schema for customer events or web pixels
  const q = `{
    __schema {
      types {
        name
      }
    }
  }`;
  const res = await adminGraphql(q);
  const types = res.__schema.types.filter(t => 
    t.name.toLowerCase().includes('pixel') || 
    t.name.toLowerCase().includes('customerevent')
  );
  console.log('Matching types:', types.map(t => t.name));
}

main().catch(console.error);

