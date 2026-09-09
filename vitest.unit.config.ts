import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'node',
    include: [
      'src/api/**/*.test.ts',
      'src/features/auth/auth-session.test.ts',
      'src/features/admin-users/**/*.test.ts',
      'src/features/students/**/*.test.ts',
    ],
  },
})
