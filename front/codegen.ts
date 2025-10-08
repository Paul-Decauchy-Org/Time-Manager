
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://graphqlzero.almansi.me/api",
  documents: "apollo/**/*.graphql",
  generates: {
    "generated/": {
      preset: "client",
      plugins: []
    }
  }
};

export default config;
