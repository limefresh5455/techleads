import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../public')
const apiUrl = (process.env.API_PROXY_URL || process.env.VITE_API_URL || '').replace(/\/$/, '')

const lines = []

if (apiUrl) {
  lines.push(`/api/*  ${apiUrl}/api/:splat  200`)
}

lines.push('/*  /index.html  200')

writeFileSync(resolve(publicDir, '_redirects'), `${lines.join('\n')}\n`)

if (apiUrl) {
  console.log(`Wrote _redirects with API proxy -> ${apiUrl}`)
} else {
  console.warn('Wrote _redirects without API proxy. Set API_PROXY_URL on Netlify to your backend URL.')
}
