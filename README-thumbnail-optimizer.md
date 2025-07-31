# 缩略图优化工具

这是一个智能的缩略图优化工具，可以将图片压缩到指定大小（默认20KB），同时保持最小尺寸要求（250x250）。

## 功能特点

- 🎯 **精确控制**: 目标文件大小控制在20KB左右
- 📏 **尺寸保护**: 最小尺寸不低于250x250像素
- 🔄 **智能算法**: 使用二分查找优化质量参数
- 📊 **详细统计**: 提供压缩率和处理统计
- 🚀 **批量处理**: 支持批量处理多个目录

## 安装依赖

```bash
npm install
```

## 使用方法

### 1. 处理所有目录

```bash
node advanced-thumbnail-optimizer.js
```

### 2. 处理特定目录

```bash
# 处理推广资源
node advanced-thumbnail-optimizer.js promotion

# 处理沙盒资源
node advanced-thumbnail-optimizer.js sandbox

# 处理标准资源
node advanced-thumbnail-optimizer.js standards
```

### 3. 使用npm脚本

```bash
# 处理所有目录
npm run optimize

# 处理特定目录
npm run optimize:promotion
npm run optimize:sandbox
npm run optimize:standards
```

## 优化结果

### 处理统计
- **promotion目录**: 82个文件，平均20.6KB，81/82达到目标大小
- **sandbox目录**: 19个文件，平均20.4KB，19/19达到目标大小  
- **standards目录**: 1个文件，15.7KB，1/1达到目标大小

### 压缩效果
- 平均压缩率: 90-99%
- 文件大小: 15-22KB
- 尺寸范围: 250x250 到 800x800
- 质量参数: 50-95

## 配置参数

可以在脚本中调整以下参数：

```javascript
const optimizer = new AdvancedThumbnailOptimizer({
  targetSizeKB: 20,           // 目标文件大小(KB)
  minDimensions: { width: 250, height: 250 },  // 最小尺寸
  maxDimensions: { width: 800, height: 800 },  // 最大尺寸
  qualityRange: { min: 50, max: 95 },          // 质量范围
  stepSize: 3,                // 质量调整步长
  tolerance: 2,               // 目标大小容差
  maxAttempts: 15             // 最大尝试次数
});
```

## 支持的格式

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- TIFF (.tiff)
- BMP (.bmp)

## 算法说明

1. **尺寸计算**: 根据目标大小和原图尺寸计算初始尺寸
2. **质量优化**: 使用二分查找找到最佳质量参数
3. **尺寸调整**: 如果质量调整无效，动态调整尺寸
4. **格式转换**: 统一输出为JPEG格式，使用mozjpeg优化

## 文件结构

```
damimax.github.io/
├── thumbnail-optimizer.js          # 基础优化脚本
├── advanced-thumbnail-optimizer.js # 高级优化脚本
├── package.json                    # 项目配置
└── resources/
    ├── promotion/
    │   ├── resource/              # 原始图片
    │   └── thumbnail/             # 优化后的缩略图
    ├── sandbox/
    │   ├── resource/
    │   └── thumbnail/
    └── standards/
        ├── resource/
        └── thumbnail/
```

## 注意事项

1. 确保有足够的磁盘空间存储优化后的文件
2. 原始文件不会被修改，优化后的文件会覆盖thumbnail目录中的文件
3. 建议在运行前备份重要文件
4. 处理大量文件时可能需要较长时间

## 性能优化

- 使用Sharp库进行高效图片处理
- 支持并行处理（可扩展）
- 智能缓存和内存管理
- 渐进式JPEG编码

## 故障排除

### 常见问题

1. **Sharp安装失败**
   ```bash
   npm rebuild sharp
   ```

2. **内存不足**
   - 减少maxAttempts参数
   - 分批处理文件

3. **文件权限问题**
   ```bash
   chmod +x advanced-thumbnail-optimizer.js
   ```

## 更新日志

- v1.0.0: 初始版本，支持基础优化功能
- v1.1.0: 添加高级优化算法和统计功能
- v1.2.0: 支持命令行参数和批量处理

## 许可证

MIT License 