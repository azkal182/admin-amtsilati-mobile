import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: [
      'src/hooks/use-table-url-state.test.ts',
      'src/lib/cookies.test.ts',
    ],
  },
})
