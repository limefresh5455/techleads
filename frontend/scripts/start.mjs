import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const serveBin = require.resolve('serve/build/main.js')
const dist = resolve(__dirname, '../dist')
const port = process.env.PORT || '3000'

const child = spawn(
  process.execPath,
  [serveBin, '-s', dist, '-l', `tcp://0.0.0.0:${port}`],
  { stdio: 'inherit' },
)

child.on('exit', (code) => process.exit(code ?? 1))
