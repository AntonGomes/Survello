import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-fetch',
  input: '../backend/openapi.json',
  output: 'src/client',
  plugins: [
    '@tanstack/react-query',
    {
      name: '@hey-api/typescript',
      enums: 'javascript',
    }
  ],
});
