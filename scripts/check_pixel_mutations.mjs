import { adminGraphql } from './config.mjs';

async function main() {
  const query = `{
    __type(name: "Mutation") {
      fields {
        name
        args {
          name
        }
      }
    }
  }`;
  const res = await adminGraphql(query);
  const pixelMutations = res.__type.fields.filter(f => f.name.toLowerCase().includes('pixel'));
  console.log('Pixel mutations:', pixelMutations.map(f => f.name));
}

main().catch(console.error);

