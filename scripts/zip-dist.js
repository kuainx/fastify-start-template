import archiver from 'archiver'

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const mode = process.argv[2] // 'dev' or 'build'

const commonFiles = [
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'tsconfig.json',
  'prisma.config.ts',
  '.env',
  '.env.example',
]

const filesToZip =
  mode === 'dev' ? ['src', ...commonFiles] : ['dist', 'src/prisma/schema.prisma', ...commonFiles]

const zipName = 'fastify-api.zip'
const output = fs.createWriteStream(path.join(rootDir, zipName))
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
  console.log(`Distribution package created: ${archive.pointer()} total bytes`)
})

output.on('error', (err) => {
  throw err
})

archive.pipe(output)

for (const file of filesToZip) {
  const filePath = path.join(rootDir, file)
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath)
    if (stats.isDirectory()) {
      archive.directory(filePath, file)
      console.log(`Added directory: ${file}`)
    } else {
      archive.file(filePath, { name: file })
      console.log(`Added file: ${file}`)
    }
  } else {
    console.warn(`Warning: ${file} not found, skipping`)
  }
}

archive.finalize()
