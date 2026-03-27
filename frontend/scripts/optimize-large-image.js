/**
 * Script to optimize the large onam-cultural-night.jpg file
 * This script compresses and resizes the image to reduce file size
 */

import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PUBLIC_DIR = path.join(__dirname, '../public')

const buildPaths = () => {
  const inputArg = process.argv[2]
  const outputArg = process.argv[3]

  if (!inputArg) {
    const defaultInput = path.join(PUBLIC_DIR, 'onam-cultural-night.jpg')
    const defaultOutput = path.join(PUBLIC_DIR, 'onam-cultural-night-optimized.jpg')
    return { inputFile: defaultInput, outputFile: defaultOutput, fromDefault: true }
  }

  const resolvedInput = path.isAbsolute(inputArg) ? inputArg : path.resolve(process.cwd(), inputArg)
  const resolvedOutput = outputArg
    ? (path.isAbsolute(outputArg) ? outputArg : path.resolve(process.cwd(), outputArg))
    : path.join(path.dirname(resolvedInput), `${path.parse(resolvedInput).name}-optimized.jpg`)

  return { inputFile: resolvedInput, outputFile: resolvedOutput, fromDefault: false }
}

const optimizeLargeImage = async () => {
  const { inputFile, outputFile, fromDefault } = buildPaths()

  try {
    // Check if file exists
    await fs.access(inputFile)
    console.log(`Found image: ${inputFile}`)
    
    // Get original file size
    const originalStats = await fs.stat(inputFile)
    const originalSizeMB = (originalStats.size / (1024 * 1024)).toFixed(2)
    console.log(`Original file size: ${originalSizeMB} MB`)
    
    // Optimize image: resize to max 1200px width, compress to 85% quality
    await sharp(inputFile)
      .resize(1200, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ 
        quality: 85,
        progressive: true,
        mozjpeg: true
      })
      .toFile(outputFile)
    
    // Get optimized file size
    const optimizedStats = await fs.stat(outputFile)
    const optimizedSizeMB = (optimizedStats.size / (1024 * 1024)).toFixed(2)
    const savings = ((1 - optimizedStats.size / originalStats.size) * 100).toFixed(1)
    
    console.log(`\n✅ Optimization complete!`)
    console.log(`Optimized file size: ${optimizedSizeMB} MB`)
    console.log(`Size reduction: ${savings}%`)
    console.log(`\nOptimized file saved to: ${outputFile}`)
    console.log(`\n⚠️  Next steps:`)
    console.log(`1. Review the optimized image quality`)
    console.log(`2. If satisfied, replace the original:`)
    console.log(`   mv ${outputFile} ${inputFile}`)
    console.log(`3. Or manually replace onam-cultural-night.jpg with the optimized version`)
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      if (fromDefault) {
        console.warn(`⚠️  Skipping optimization: default file not found (${inputFile})`)
        console.warn('Provide a file path: node scripts/optimize-large-image.js <input-file> [output-file]')
        return
      }
      console.error(`❌ Error: File not found: ${inputFile}`)
      console.error('Please provide a valid input file path.')
    } else {
      console.error(`❌ Error optimizing image:`, error.message)
    }
    process.exit(1)
  }
}

optimizeLargeImage()

