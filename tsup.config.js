// tsup.config.js
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  external: [/^[^./]/],
  outDir: 'dist',
  clean: true,
  dts: true,
  platform: 'node',
})
