#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class AggressiveThumbnailOptimizer {
  constructor(options = {}) {
    this.targetSizeKB = options.targetSizeKB || 15;
    this.minDimensions = options.minDimensions || { width: 200, height: 200 };
    this.maxDimensions = options.maxDimensions || { width: 600, height: 600 };
    this.qualityRange = options.qualityRange || { min: 30, max: 85 };
    this.stepSize = options.stepSize || 2;
    this.tolerance = options.tolerance || 1;
    this.maxAttempts = options.maxAttempts || 20;
    this.enableWebP = options.enableWebP || false;
  }

  async optimizeImage(inputPath, outputPath) {
    try {
      const metadata = await sharp(inputPath).metadata();
      const originalSizeKB = fs.statSync(inputPath).size / 1024;
      
      console.log(`\n🖼️  处理: ${path.basename(inputPath)}`);
      console.log(`   原始: ${metadata.width}x${metadata.height}, ${originalSizeKB.toFixed(1)}KB`);

      let { width, height } = this.calculateOptimalDimensions(metadata.width, metadata.height, originalSizeKB);
      
      const result = await this.aggressiveOptimization(inputPath, outputPath, width, height, originalSizeKB);
      
      if (result) {
        const compressionRatio = ((1 - result.sizeKB / originalSizeKB) * 100).toFixed(1);
        console.log(`✅ 完成: ${path.basename(outputPath)}`);
        console.log(`   最终: ${result.width}x${result.height}, ${result.sizeKB.toFixed(1)}KB`);
        console.log(`   压缩率: ${compressionRatio}%`);
        console.log(`   质量: ${result.quality}`);
        if (result.format) console.log(`   格式: ${result.format}`);
      }

      return result;

    } catch (error) {
      console.error(`❌ 失败: ${path.basename(inputPath)} - ${error.message}`);
      return null;
    }
  }

  async aggressiveOptimization(inputPath, outputPath, width, height, originalSizeKB) {
    let bestResult = null;
    let bestScore = Infinity;

    // 策略1: 激进的JPEG压缩
    const jpegResult = await this.aggressiveJPEGOptimization(inputPath, outputPath, width, height);
    if (jpegResult && this.evaluateResult(jpegResult) < bestScore) {
      bestResult = jpegResult;
      bestScore = this.evaluateResult(jpegResult);
    }

    // 策略2: WebP格式（如果启用）
    if (this.enableWebP) {
      const webpPath = outputPath.replace(/\.[^.]+$/, '.webp');
      const webpResult = await this.webpOptimization(inputPath, webpPath, width, height);
      if (webpResult && this.evaluateResult(webpResult) < bestScore) {
        bestResult = webpResult;
        bestScore = this.evaluateResult(webpResult);
      }
    }

    // 策略3: 更小的尺寸
    const smallerResult = await this.smallerSizeOptimization(inputPath, outputPath, originalSizeKB);
    if (smallerResult && this.evaluateResult(smallerResult) < bestScore) {
      bestResult = smallerResult;
      bestScore = this.evaluateResult(smallerResult);
    }

    return bestResult;
  }

  async aggressiveJPEGOptimization(inputPath, outputPath, width, height) {
    let quality = this.qualityRange.max;
    let minQuality = this.qualityRange.min;
    let maxQuality = this.qualityRange.max;
    let bestResult = null;
    let attempts = 0;

    while (attempts < this.maxAttempts && (maxQuality - minQuality) > this.stepSize) {
      attempts++;
      
      const result = await this.compressImage(inputPath, outputPath, width, height, quality);
      
      if (Math.abs(result.sizeKB - this.targetSizeKB) <= this.tolerance) {
        return result;
      }

      if (result.sizeKB > this.targetSizeKB) {
        maxQuality = quality;
        quality = Math.max(minQuality, quality - this.stepSize);
      } else {
        minQuality = quality;
        quality = Math.min(maxQuality, quality + this.stepSize);
        bestResult = result;
      }
    }

    return bestResult;
  }

  async webpOptimization(inputPath, outputPath, width, height) {
    try {
      const buffer = await sharp(inputPath)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({
          quality: 60,
          effort: 6,
          nearLossless: false,
          smartSubsample: true
        })
        .toBuffer();

      fs.writeFileSync(outputPath, buffer);
      const sizeKB = buffer.length / 1024;

      return {
        width,
        height,
        sizeKB,
        quality: 60,
        format: 'webp',
        path: outputPath
      };
    } catch (error) {
      return null;
    }
  }

  async smallerSizeOptimization(inputPath, outputPath, originalSizeKB) {
    const metadata = await sharp(inputPath).metadata();
    const aspectRatio = metadata.width / metadata.height;
    
    // 计算更小的目标尺寸
    const targetArea = (this.targetSizeKB / originalSizeKB) * (metadata.width * metadata.height) * 0.8; // 额外缩小20%
    const scaleFactor = Math.sqrt(targetArea / (metadata.width * metadata.height));
    
    let width = Math.max(this.minDimensions.width, Math.round(metadata.width * scaleFactor));
    let height = Math.max(this.minDimensions.height, Math.round(metadata.height * scaleFactor));
    
    if (width / height > aspectRatio) {
      width = Math.round(height * aspectRatio);
    } else {
      height = Math.round(width / aspectRatio);
    }

    return await this.compressImage(inputPath, outputPath, width, height, this.qualityRange.min);
  }

  calculateOptimalDimensions(originalWidth, originalHeight, originalSizeKB) {
    const aspectRatio = originalWidth / originalHeight;
    
    if (originalWidth <= this.minDimensions.width && originalHeight <= this.minDimensions.height) {
      return { width: originalWidth, height: originalHeight };
    }

    // 更激进的目标尺寸计算
    const targetArea = (this.targetSizeKB / originalSizeKB) * (originalWidth * originalHeight) * 0.9;
    const scaleFactor = Math.sqrt(targetArea / (originalWidth * originalHeight));
    
    let width = Math.max(this.minDimensions.width, Math.round(originalWidth * scaleFactor));
    let height = Math.max(this.minDimensions.height, Math.round(originalHeight * scaleFactor));
    
    if (width > this.maxDimensions.width) {
      width = this.maxDimensions.width;
      height = Math.round(width / aspectRatio);
    }
    if (height > this.maxDimensions.height) {
      height = this.maxDimensions.height;
      width = Math.round(height * aspectRatio);
    }

    return { width, height };
  }

  async compressImage(inputPath, outputPath, width, height, quality) {
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const buffer = await sharp(inputPath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: quality,
        progressive: true,
        mozjpeg: true,
        trellisQuantisation: true,
        overshootDeringing: true,
        optimizeScans: true,
        quantisationTable: 3
      })
      .toBuffer();

    fs.writeFileSync(outputPath, buffer);
    
    return {
      width,
      height,
      sizeKB: buffer.length / 1024,
      quality,
      path: outputPath
    };
  }

  evaluateResult(result) {
    const sizeDiff = Math.abs(result.sizeKB - this.targetSizeKB);
    const dimensionScore = Math.max(0, this.minDimensions.width - result.width) + 
                          Math.max(0, this.minDimensions.height - result.height);
    
    return sizeDiff + dimensionScore * 0.05; // 更重视文件大小
  }

  async processDirectory(inputDir, outputDir) {
    console.log(`\n📁 处理目录: ${inputDir}`);
    console.log(`📁 输出目录: ${outputDir}`);
    console.log('='.repeat(60));

    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.bmp'];
    const files = fs.readdirSync(inputDir)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return supportedExtensions.includes(ext);
      });

    console.log(`找到 ${files.length} 个图片文件`);

    const results = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`\n[${i + 1}/${files.length}]`);
      
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);
      
      const result = await this.optimizeImage(inputPath, outputPath);
      if (result) {
        results.push(result);
      }
    }

    this.printSummary(results);
    return results;
  }

  printSummary(results) {
    if (results.length === 0) return;

    const totalSize = results.reduce((sum, r) => sum + r.sizeKB, 0);
    const avgSize = totalSize / results.length;
    const targetFiles = results.filter(r => Math.abs(r.sizeKB - this.targetSizeKB) <= 3);

    console.log('\n' + '='.repeat(60));
    console.log('📊 激进优化统计');
    console.log(`处理文件数: ${results.length}`);
    console.log(`平均文件大小: ${avgSize.toFixed(1)}KB`);
    console.log(`达到目标大小(±3KB): ${targetFiles.length}/${results.length}`);
    console.log(`总大小: ${totalSize.toFixed(1)}KB`);
    console.log('='.repeat(60));
  }
}

async function main() {
  const args = process.argv.slice(2);
  const targetDir = args[0];

  const optimizer = new AggressiveThumbnailOptimizer({
    targetSizeKB: 15,
    minDimensions: { width: 200, height: 200 },
    maxDimensions: { width: 600, height: 600 },
    qualityRange: { min: 30, max: 85 },
    stepSize: 2,
    tolerance: 1,
    maxAttempts: 20,
    enableWebP: false
  });

  const resourceDirs = [
    { input: 'resources/promotion/resource', output: 'resources/promotion/thumbnail' },
    { input: 'resources/sandbox/resource', output: 'resources/sandbox/thumbnail' },
    { input: 'resources/standards/resource', output: 'resources/standards/thumbnail' }
  ];

  if (targetDir) {
    const dir = resourceDirs.find(d => d.input.includes(targetDir));
    if (dir && fs.existsSync(dir.input)) {
      await optimizer.processDirectory(dir.input, dir.output);
    } else {
      console.error(`❌ 目录不存在: ${targetDir}`);
    }
  } else {
    for (const dir of resourceDirs) {
      if (fs.existsSync(dir.input)) {
        await optimizer.processDirectory(dir.input, dir.output);
      }
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AggressiveThumbnailOptimizer; 