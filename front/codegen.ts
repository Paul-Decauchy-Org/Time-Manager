
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:8084/query",
  documents: "apollo/**/*.graphql",
  generates: {
    "generated/": {
      preset: "client",
      plugins: []
    }
  }
};

export default config;
