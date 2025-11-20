import type { CodegenConfig } from '@graphql-codegen/cli';

const schemaUrl = process.env.NEXT_PUBLIC_SCHEMA_URL || "./schema.graphql";

const config: CodegenConfig = {
  overwrite: true,
  schema: schemaUrl,
  documents: "apollo/**/*.graphql",
  generates: {
    "generated/": {
      preset: "client",
      plugins: []
    }
  }
};

export default config;