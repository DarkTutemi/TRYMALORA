import { adminGraphql } from './config.mjs';

async function main() {
  const res = await adminGraphql(`{
    __type(name: "Mutation") {
      fields {
        name
        args {
          name
          type { name kind ofType { name kind } }
        }
      }
    }
  }`);
  const f = res.__type.fields.find(x => x.name === 'sellingPlanGroupUpdate');
  console.log(JSON.stringify(f, null, 2));
}

main().catch(console.error);

