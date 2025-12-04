/**
 * Image Optimization Script
 * Converts images to WebP format for better performance
 * 
 * Requirements:
 * - Install sharp: npm install --save-dev sharp
 * 
 * Usage:
 * node scripts/optimize-images.js
 */

import sharp from 'sharp'
import { readdir, stat, mkdir } from 'fs/promises'
import { join, dirname, extname, basename } from 'path'
import { existsSync } from 'fs'

const PUBLIC_DIR = join(process.cwd(), 'public')
const OUTPUT_DIR = join(process.cwd(), 'public')

// Image formats to convert
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png']

// Quality settings
const WEBP_QUALITY = 85
const JPEG_QUALITY = 85

/**
 * Convert image to WebP format
 */
async function convertToWebP(inputPath, outputPath) {
  try {
    const metadata = await sharp(inputPath).metadata()
    
    // Determine if we should resize based on dimensions
    let pipeline = sharp(inputPath)
    
    // Resize large images (logo should be smaller)
    if (basename(inputPath).includes('logo')) {
      // Logo is displayed at max 56px, so create multiple sizes
      const sizes = [56, 112, 168] // 1x, 2x, 3x for retina
      for (const size of sizes) {
        const sizeOutputPath = outputPath.replace('.webp', `-${size}w.webp`)
        await sharp(inputPath)
          .resize(size, size, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toFile(sizeOutputPath)
        console.log(`✓ Created ${sizeOutputPath} (${size}x${size})`)
      }
    } else if (metadata.width > 800) {
      // Resize large images to max 800px width
      pipeline = pipeline.resize(800, null, { fit: 'inside', withoutEnlargement: true })
    }
    
    // Convert to WebP
    await pipeline
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPath)
    
    console.log(`✓ Converted ${inputPath} → ${outputPath}`)
    return true
  } catch (error) {
    console.error(`✗ Error converting ${inputPath}:`, error.message)
    return false
  }
}

/**
 * Optimize JPEG/PNG images (compress existing)
 */
async function optimizeOriginal(inputPath) {
  try {
    const ext = extname(inputPath).toLowerCase()
    const outputPath = inputPath // Overwrite original
    
    if (ext === '.jpg' || ext === '.jpeg') {
      await sharp(inputPath)
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toFile(outputPath)
      console.log(`✓ Optimized ${inputPath}`)
    } else if (ext === '.png') {
      await sharp(inputPath)
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(outputPath)
      console.log(`✓ Optimized ${inputPath}`)
    }
    
    return true
  } catch (error) {
    console.error(`✗ Error optimizing ${inputPath}:`, error.message)
    return false
  }
}

/**
 * Process all images in directory
 */
async function processImages(dir) {
  try {
    const files = await readdir(dir)
    let processed = 0
    let errors = 0
    
    for (const file of files) {
      const filePath = join(dir, file)
      const stats = await stat(filePath)
      
      if (stats.isDirectory()) {
        // Recursively process subdirectories
        const subProcessed = await processImages(filePath)
        processed += subProcessed.processed
        errors += subProcessed.errors
      } else {
        const ext = extname(file).toLowerCase()
        
        if (IMAGE_EXTENSIONS.includes(ext)) {
          // Create WebP version
          const webpPath = join(dirname(filePath), `${basename(filePath, ext)}.webp`)
          const success = await convertToWebP(filePath, webpPath)
          
          if (success) {
            processed++
          } else {
            errors++
          }
          
          // Also optimize original
          await optimizeOriginal(filePath)
        }
      }
    }
    
    return { processed, errors }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message)
    return { processed: 0, errors: 1 }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🖼️  Starting image optimization...\n')
  console.log(`Input directory: ${PUBLIC_DIR}`)
  console.log(`Output directory: ${OUTPUT_DIR}\n`)
  
  if (!existsSync(PUBLIC_DIR)) {
    console.error(`✗ Directory ${PUBLIC_DIR} does not exist!`)
    process.exit(1)
  }
  
  const result = await processImages(PUBLIC_DIR)
  
  console.log('\n✅ Image optimization complete!')
  console.log(`   Processed: ${result.processed} images`)
  if (result.errors > 0) {
    console.log(`   Errors: ${result.errors}`)
  }
  console.log('\n💡 Tip: Make sure to commit both .webp and original image files')
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { convertToWebP, optimizeOriginal }

