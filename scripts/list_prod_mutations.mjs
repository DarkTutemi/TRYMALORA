import { adminGraphql } from './config.mjs';

async function main() {
  const query = `{
    __type(name: "Mutation") {
      fields {
        name
      }
    }
  }`;
  const res = await adminGraphql(query);
  const vMutations = res.__type.fields.filter(f => f.name.toLowerCase().includes('variant'));
  console.log('Variant mutations:', vMutations.map(f => f.name));
}

main().catch(console.error);
