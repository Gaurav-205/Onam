import { readdirSync, statSync } from 'fs'
import { extname, join } from 'path'
import { spawnSync } from 'child_process'

const rootDir = process.cwd()
const ignoredDirs = new Set(['node_modules', '.git'])

const collectJavaScriptFiles = (dir) => {
  const entries = readdirSync(dir)
  const files = []

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      if (!ignoredDirs.has(entry)) {
        files.push(...collectJavaScriptFiles(fullPath))
      }
      continue
    }

    if (stat.isFile() && extname(fullPath) === '.js') {
      files.push(fullPath)
    }
  }

  return files
}

const files = collectJavaScriptFiles(rootDir)
const failedFiles = []

for (const filePath of files) {
  const result = spawnSync(process.execPath, ['--check', filePath], {
    stdio: 'pipe',
    encoding: 'utf-8'
  })

  if (result.status !== 0) {
    failedFiles.push({ filePath, output: result.stderr || result.stdout })
  }
}

if (failedFiles.length > 0) {
  console.error('JavaScript syntax check failed for the following files:')
  for (const failure of failedFiles) {
    console.error(`\n- ${failure.filePath}`)
    if (failure.output) {
      console.error(failure.output.trim())
    }
  }
  process.exit(1)
}

console.log(`Syntax check passed for ${files.length} JavaScript files.`)
