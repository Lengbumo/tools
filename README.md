# 实用工具箱 (Tools)

一个基于 Vue 3 + Element Plus 的在线工具集合，提供各种实用的文本处理、图片处理、日期计算等功能。

## 🚀 项目特色

- **现代化界面**: 基于 Element Plus 设计，界面美观简洁
- **响应式布局**: 支持桌面端和移动端，自适应不同屏幕尺寸
- **功能丰富**: 涵盖文本处理、图像处理、日期计算、视频处理等多个类别
- **无需安装**: 纯前端实现，打开即用
- **开源免费**: MIT 许可证，可自由使用和修改

## 📦 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **代码编辑器**: CodeMirror 5
- **路由**: Vue Router 4
- **开发语言**: TypeScript + JavaScript

## 🛠️ 功能模块

### 文本处理工具

#### 1. JSON 格式化器 (`/text/json-formatter`)

- **功能描述**: 提供 JSON 数据的格式化、压缩、验证功能
- **主要特性**:
  - 实时语法检查和错误提示

#### 2. 文本对比工具 (`/text/text-comparison`) ✨ **新功能**

- **功能描述**: 智能文本差异对比，高亮显示文本间的差异
- **主要特性**:
  - 基于 LCS (最长公共子序列) 算法的智能差异检测
  - 逐行对比，精确标识新增、删除、修改的内容
  - 实时统计信息显示（总行数、新增行、删除行等）
  - 支持多种文件格式导入（.txt, .md, .json, .xml, .html, .css, .js, .ts, .vue, .py, .java, .cpp, .c, .h）
- **算法实现**:
  - 使用动态规划实现 LCS 算法
  - 支持大文本处理（优化的内存使用）
  - 提供字符级和行级两种对比模式

### 图像处理工具

#### 3. 图片压缩 (`/image/image-compression`) ✨ **新功能**

- **功能描述**: 智能图片压缩和格式转换，支持批量处理

#### 4. 二维码生成器 (`/image/qr-generator`) ✨ **更新功能**

- **功能描述**: 在线生成自定义二维码，支持文本、网址等内容

#### 5. OCR 识别 (`/image/ocr-recognition`)

- **功能描述**: 图片文字识别和提取
- **开发状态**: 开发中

### 日期时间工具

#### 5. 日期计算器 (`/date/date-calculator`)

- **功能描述**: 提供全面的日期计算功能，包括日期加减、差值计算、年龄计算、倒计时等

#### 6. 时间戳转换 (`/date/timestamp-converter`)

- **功能描述**: Unix 时间戳与人类可读时间的相互转换，支持多时区和批量处理

#### 7. Cron 表达式工具 (`/date/cron`)

- **功能描述**: 专业的 Cron 表达式生成器和解析器，支持可视化配置和执行时间预测

### 视频处理工具

#### 7. 视频压缩 (`/video/video-compression`)

- **功能描述**: 在线视频压缩和格式转换
- **开发状态**: 开发中

## 🏗️ 项目结构

```
tools/
├── public/                 # 静态资源
│   └── favicon.ico
├── src/
│   ├── assets/            # 资源文件
│   │   ├── base.css       # 基础样式
│   │   ├── logo.svg       # Logo 图标
│   │   └── main.css       # 主样式文件
│   ├── components/        # 可复用组件
│   │   ├── icons/         # 图标组件
│   │   ├── HelloWorld.vue # 欢迎组件
│   │   ├── TheWelcome.vue # 主页面欢迎区域
│   │   └── WelcomeItem.vue# 欢迎项组件
│   ├── router/            # 路由配置
│   │   └── index.js       # 路由定义
│   ├── utils/             # 工具类
│   │   ├── JsonUtils.ts   # JSON 处理工具
│   │   ├── TextDiffUtils.ts # 文本差异算法工具 ✨
│   │   └── ImageUtils.ts  # 图片处理工具 ✨
│   ├── views/             # 页面视图
│   │   ├── date/          # 日期工具页面
│   │   │   ├── DateCalculator.vue    # 日期计算器
│   │   │   ├── TimestampConverter.vue # 时间戳转换器
│   │   │   └── CronExpression.vue     # Cron表达式工具 ✨
│   │   ├── image/         # 图像工具页面
│   │   │   ├── ImageCompression.vue # 图片压缩器 ✨
│   │   │   └── OcrRecognition.vue   # OCR识别器
│   │   ├── text/          # 文本工具页面
│   │   │   ├── JsonFormatter.vue    # JSON格式化器
│   │   │   └── TextComparison.vue   # 文本对比器 ✨
│   │   └── video/         # 视频工具页面
│   ├── App.vue            # 主应用组件
│   └── main.js            # 应用入口
├── index.html             # HTML 模板
├── package.json           # 依赖配置
├── vite.config.js         # Vite 配置
└── README.md              # 项目说明
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

### 使用构建镜像

```bash
# 直接拉取并启动预构建镜像
docker run -d -p 8999:80 --name tools-app lengbumo/tools:latest
```

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add some amazing feature'`
4. 推送到分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🎯 未来规划

### 长期目标

- [ ] 添加更多文本处理工具 (正则表达式测试器、Base64 编解码等)
- [ ] 实现视频处理功能
- [ ] 添加数据转换工具 (CSV/Excel 处理等)
- [ ] 支持多语言国际化
- [ ] 实现用户偏好设置保存

### 技术改进

- [ ] 引入 Web Workers 优化大文件处理性能
- [ ] 实现 PWA 支持，提供离线使用能力
- [ ] 优化构建配置，减少包体积

## 🆕 最新更新

### v1.2.0 - 二维码生成器功能增强

**新增功能**:

- ✨ 二维码生成器新增 Logo 导入功能，支持自定义品牌标识
- 🎨 可调节 Logo 大小比例（10%-50%），适配不同需求
- 🔧 可调节 Logo 透明度（10%-100%），实现完美视觉效果
- 🛡️ 自动在 Logo 周围添加背景保护，确保二维码识别率
- 📁 支持拖拽上传，操作更加便捷

**技术改进**:

- 🎯 使用 Canvas API 实现 Logo 与二维码的完美融合
- 📊 优化图片处理算法，确保输出质量
- 🔍 增强文件上传验证，支持多种图片格式
- 💾 保持原有下载功能，支持带 Logo 的二维码导出

**代码质量**:

- 📚 更新项目文档，详细说明新增功能特性
- 🔧 保持代码结构清晰，遵循组件化开发原则
- ✅ 完善错误处理和用户体验优化

---
