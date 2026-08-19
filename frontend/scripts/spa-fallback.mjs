import { copyFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, '../dist')
const indexHtml = resolve(distDir, 'index.html')
const notFoundHtml = resolve(distDir, '404.html')

if (!existsSync(indexHtml)) {
  console.error('spa-fallback: dist/index.html missing — run vite build first')
  process.exit(1)
}

copyFileSync(indexHtml, notFoundHtml)
console.log('spa-fallback: wrote dist/404.html for host SPA fallback')
