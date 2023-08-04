import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    root: process.cwd(),
    plugins: [tsconfigPaths()],
    test: {},
    resolve: {},
})
