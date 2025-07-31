const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class ThumbnailOptimizer {
  constructor() {
    this.targetSizeKB = 20;
    this.minDimensions = { width: 250, height: 250 };
    this.maxDimensions = { width: 800, height: 800 };
    this.qualityRange = { min: 60, max: 90 };
    this.stepSize = 5;
  }

  /**
   * 智能压缩图片到目标大小
   * @param {string} inputPath 输入图片路径
   * @param {string} outputPath 输出图片路径
   * @returns {Promise<Object>} 压缩结果
   */
  async optimizeImage(inputPath, outputPath) {
    try {
      // 获取原始图片信息
      const metadata = await sharp(inputPath).metadata();
      console.log(`处理图片: ${path.basename(inputPath)}`);
      console.log(`原始尺寸: ${metadata.width}x${metadata.height}`);
      console.log(`原始格式: ${metadata.format}`);

      // 计算初始尺寸，保持宽高比
      let { width, height } = this.calculateInitialDimensions(metadata.width, metadata.height);
      
      // 二分查找最佳质量参数
      let quality = this.qualityRange.max;
      let minQuality = this.qualityRange.min;
      let maxQuality = this.qualityRange.max;
      let bestResult = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        attempts++;
        
        // 创建输出目录
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        // 压缩图片
        const result = await this.compressImage(inputPath, outputPath, width, height, quality);
        
        console.log(`尝试 ${attempts}: 质量=${quality}, 尺寸=${width}x${height}, 大小=${result.sizeKB.toFixed(1)}KB`);

        // 检查是否达到目标
        if (Math.abs(result.sizeKB - this.targetSizeKB) <= 2) {
          bestResult = result;
          break;
        }

        // 调整质量参数
        if (result.sizeKB > this.targetSizeKB) {
          maxQuality = quality;
          quality = Math.max(minQuality, quality - this.stepSize);
        } else {
          minQuality = quality;
          quality = Math.min(maxQuality, quality + this.stepSize);
        }

        // 如果质量调整无效，尝试调整尺寸
        if (quality === minQuality && result.sizeKB > this.targetSizeKB) {
          const scaleFactor = Math.sqrt(this.targetSizeKB / result.sizeKB);
          width = Math.max(this.minDimensions.width, Math.round(width * scaleFactor));
          height = Math.max(this.minDimensions.height, Math.round(height * scaleFactor));
          quality = this.qualityRange.max; // 重置质量
        }

        // 如果尺寸已经最小，降低质量
        if (width <= this.minDimensions.width && height <= this.minDimensions.height) {
          quality = Math.max(this.qualityRange.min, quality - this.stepSize);
        }
      }

      if (bestResult) {
        console.log(`✅ 优化完成: ${path.basename(outputPath)}`);
        console.log(`   最终尺寸: ${bestResult.width}x${bestResult.height}`);
        console.log(`   最终大小: ${bestResult.sizeKB.toFixed(1)}KB`);
        console.log(`   压缩率: ${((1 - bestResult.sizeKB / (bestResult.originalSizeKB || 100)) * 100).toFixed(1)}%`);
        console.log('---');
        return bestResult;
      } else {
        console.log(`⚠️  未达到目标大小，使用最后一次尝试的结果`);
        return result;
      }

    } catch (error) {
      console.error(`❌ 处理失败: ${path.basename(inputPath)}`, error.message);
      return null;
    }
  }

  /**
   * 计算初始尺寸
   */
  calculateInitialDimensions(originalWidth, originalHeight) {
    const aspectRatio = originalWidth / originalHeight;
    
    // 如果原图小于最小尺寸，直接使用原图尺寸
    if (originalWidth <= this.minDimensions.width && originalHeight <= this.minDimensions.height) {
      return { width: originalWidth, height: originalHeight };
    }

    // 计算缩放后的尺寸
    let width, height;
    
    if (aspectRatio > 1) {
      // 横向图片
      width = Math.min(this.maxDimensions.width, originalWidth);
      height = Math.round(width / aspectRatio);
      
      // 确保不小于最小尺寸
      if (height < this.minDimensions.height) {
        height = this.minDimensions.height;
        width = Math.round(height * aspectRatio);
      }
    } else {
      // 纵向图片
      height = Math.min(this.maxDimensions.height, originalHeight);
      width = Math.round(height * aspectRatio);
      
      // 确保不小于最小尺寸
      if (width < this.minDimensions.width) {
        width = this.minDimensions.width;
        height = Math.round(width / aspectRatio);
      }
    }

    return { width, height };
  }

  /**
   * 压缩图片
   */
  async compressImage(inputPath, outputPath, width, height, quality) {
    const buffer = await sharp(inputPath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: quality,
        progressive: true,
        mozjpeg: true
      })
      .toBuffer();

    // 写入文件
    fs.writeFileSync(outputPath, buffer);
    
    // 获取文件大小
    const stats = fs.statSync(outputPath);
    const sizeKB = stats.size / 1024;

    return {
      width,
      height,
      sizeKB,
      quality,
      path: outputPath
    };
  }

  /**
   * 批量处理文件夹中的图片
   */
  async processDirectory(inputDir, outputDir) {
    console.log(`开始处理目录: ${inputDir}`);
    console.log(`输出目录: ${outputDir}`);
    console.log('='.repeat(50));

    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.bmp'];
    const files = fs.readdirSync(inputDir)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return supportedExtensions.includes(ext);
      });

    console.log(`找到 ${files.length} 个图片文件`);

    const results = [];
    for (const file of files) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);
      
      const result = await this.optimizeImage(inputPath, outputPath);
      if (result) {
        results.push(result);
      }
    }

    // 统计结果
    this.printSummary(results);
    return results;
  }

  /**
   * 打印统计信息
   */
  printSummary(results) {
    if (results.length === 0) return;

    const totalOriginalSize = results.reduce((sum, r) => sum + (r.originalSizeKB || 0), 0);
    const totalCompressedSize = results.reduce((sum, r) => sum + r.sizeKB, 0);
    const avgSize = totalCompressedSize / results.length;
    const compressionRatio = ((1 - totalCompressedSize / totalOriginalSize) * 100);

    console.log('\n' + '='.repeat(50));
    console.log('📊 压缩统计');
    console.log(`处理文件数: ${results.length}`);
    console.log(`平均文件大小: ${avgSize.toFixed(1)}KB`);
    console.log(`总压缩大小: ${totalCompressedSize.toFixed(1)}KB`);
    console.log(`平均压缩率: ${compressionRatio.toFixed(1)}%`);
    
    const targetFiles = results.filter(r => Math.abs(r.sizeKB - this.targetSizeKB) <= 5);
    console.log(`达到目标大小(±5KB): ${targetFiles.length}/${results.length}`);
    console.log('='.repeat(50));
  }
}

// 使用示例
async function main() {
  const optimizer = new ThumbnailOptimizer();
  
  // 处理所有资源目录
  const resourceDirs = [
    'resources/promotion/resource',
    'resources/sandbox/resource', 
    'resources/standards/resource'
  ];

  for (const resourceDir of resourceDirs) {
    if (fs.existsSync(resourceDir)) {
      const thumbnailDir = resourceDir.replace('/resource/', '/thumbnail/');
      await optimizer.processDirectory(resourceDir, thumbnailDir);
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ThumbnailOptimizer; 