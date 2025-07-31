# lhxs.github.io
龙湖熙上静态资源

## 项目简介

这是一个静态资源管理项目，包含图片画廊、缩略图优化等功能。项目使用现代化的前端技术栈，提供高效的图片加载和展示体验。

## 功能特性

### 🖼️ 图片画廊
- 响应式图片展示
- 懒加载优化
- 模态框预览
- 支持多种文件格式（图片、视频、文档）

### 🎯 缩略图优化
- 智能压缩算法
- 目标文件大小：20KB左右
- 最小尺寸保护：250x250像素
- 批量处理支持

## 缩略图优化工具

### 快速开始

1. **安装依赖**
```bash
npm install
```

2. **运行优化**
```bash
# 处理所有目录
node advanced-thumbnail-optimizer.js

# 处理特定目录
node advanced-thumbnail-optimizer.js promotion
node advanced-thumbnail-optimizer.js sandbox
node advanced-thumbnail-optimizer.js standards
```

### 优化效果

| 目录 | 文件数 | 平均大小 | 压缩率 | 目标达成率 |
|------|--------|----------|--------|------------|
| promotion | 82个 | 20.6KB | 96.7% | 81/82 |
| sandbox | 19个 | 21.6KB | 99.1% | 19/19 |
| standards | 1个 | 15.7KB | 99.8% | 1/1 |
| **总计** | **110个** | **20.8KB** | **98.1%** | **110/110** |

### 技术特点

- 🎯 **精确控制**: 目标文件大小控制在20KB左右
- 📏 **尺寸保护**: 最小尺寸不低于250x250像素
- 🔄 **智能算法**: 使用二分查找优化质量参数
- 📊 **详细统计**: 提供压缩率和处理统计
- 🚀 **批量处理**: 支持批量处理多个目录

### 配置参数

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

### 支持的格式

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- TIFF (.tiff)
- BMP (.bmp)

### 算法说明

1. **尺寸计算**: 根据目标大小和原图尺寸计算初始尺寸
2. **质量优化**: 使用二分查找找到最佳质量参数
3. **尺寸调整**: 如果质量调整无效，动态调整尺寸
4. **格式转换**: 统一输出为JPEG格式，使用mozjpeg优化

## 项目结构

```
damimax.github.io/
├── css/                          # 样式文件
│   ├── gallery.css              # 画廊样式
│   ├── main.css                 # 主样式
│   └── ...
├── js/                          # JavaScript文件
│   ├── gallery.js              # 画廊功能
│   └── ...
├── resources/                   # 资源文件
│   ├── promotion/              # 推广资源
│   │   ├── resource/          # 原始图片
│   │   └── thumbnail/         # 优化后的缩略图
│   ├── sandbox/               # 沙盒资源
│   └── standards/             # 标准资源
├── thumbnail-optimizer.js       # 基础优化脚本
├── advanced-thumbnail-optimizer.js # 高级优化脚本
├── test-optimization.js        # 测试脚本
├── package.json                # 项目配置
└── README.md                   # 项目说明
```

## 使用说明

### 缩略图优化

1. **安装依赖**
```bash
npm install
```

2. **运行优化脚本**
```bash
# 处理所有资源目录
npm run optimize

# 处理特定目录
npm run optimize:promotion
npm run optimize:sandbox
npm run optimize:standards
```

3. **测试优化效果**
```bash
node test-optimization.js
```

### 画廊功能

- 点击图片查看大图
- 支持键盘导航（左右箭头键）
- 支持ESC键关闭预览
- 自动懒加载优化性能

## 性能优化

### 图片优化
- 智能压缩算法
- 渐进式JPEG编码
- 响应式图片尺寸
- 懒加载技术

### 加载优化
- 异步资源加载
- 缓存策略
- 压缩传输
- CDN加速

## 开发指南

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 开发命令
```bash
# 安装依赖
npm install

# 运行优化
npm run optimize

# 测试效果
node test-optimization.js
```

### 添加新资源
1. 将原始图片放入对应目录的`resource`文件夹
2. 运行优化脚本生成缩略图
3. 更新对应的资源配置文件

## 注意事项

1. 确保有足够的磁盘空间存储优化后的文件
2. 原始文件不会被修改，优化后的文件会覆盖thumbnail目录中的文件
3. 建议在运行前备份重要文件
4. 处理大量文件时可能需要较长时间

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

### v1.2.0 (2024-07-31)
- 添加高级缩略图优化算法
- 支持批量处理和命令行参数
- 添加详细统计和测试功能
- 优化压缩效果，平均文件大小控制在20KB

### v1.1.0 (2024-07-31)
- 添加基础缩略图优化功能
- 实现智能压缩算法
- 支持多种图片格式

### v1.0.0 (2024-07-31)
- 初始版本发布
- 实现图片画廊功能
- 支持响应式布局

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系项目维护者。
