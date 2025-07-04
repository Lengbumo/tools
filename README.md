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
  - 支持格式化和压缩模式切换
  - 代码折叠/展开功能
  - 支持文件导入导出
  - 复制到剪贴板功能
- **布局结构**: 左右双栏布局，左侧输入，右侧输出
- **样式特点**: 使用 CodeMirror 编辑器，提供语法高亮和行号显示

#### 2. 文本对比工具 (`/text/text-comparison`) ✨ **新功能**

- **功能描述**: 智能文本差异对比，高亮显示文本间的差异
- **主要特性**:
  - 基于 LCS (最长公共子序列) 算法的智能差异检测
  - 逐行对比，精确标识新增、删除、修改的内容
  - 实时统计信息显示（总行数、新增行、删除行等）
  - 支持多种文件格式导入（.txt, .md, .json, .xml, .html, .css, .js, .ts, .vue, .py, .java, .cpp, .c, .h）
  - 文本交换功能，便于不同角度对比
  - 行号显示和差异指示器
  - 响应式设计，支持移动端使用
- **布局结构**:
  - 编辑模式：左右双栏输入区域
  - 对比模式：统一的差异结果展示区域
  - 顶部工具栏：操作按钮和文件导入
  - 统计面板：差异数据汇总
- **样式特点**:
  - 差异高亮：绿色背景表示新增，红色背景表示删除
  - 等宽字体：使用 Monaco/Menlo 字体族保证对齐
  - 颜色编码：直观的视觉差异表示
- **算法实现**:
  - 使用动态规划实现 LCS 算法
  - 支持大文本处理（优化的内存使用）
  - 提供字符级和行级两种对比模式

### 图像处理工具

#### 3. 图片压缩 (`/image/image-compression`) ✨ **新功能**

- **功能描述**: 智能图片压缩和格式转换，支持批量处理
- **主要特性**:
  - 支持多种图片格式（JPG、PNG、GIF、WebP）
  - 可调节压缩质量（10%-100%）
  - 智能尺寸调整，支持保持宽高比
  - 格式转换功能（JPEG、PNG、WebP）
  - 拖拽上传，支持批量处理
  - 实时预览对比（压缩前后）
  - 详细的压缩统计信息
  - 批量下载功能
- **布局结构**:
  - 拖拽上传区域：支持多文件选择
  - 压缩设置面板：质量、尺寸、格式控制
  - 预览对比区域：原图与压缩图对比
  - 统计信息面板：压缩比例、大小减少等
- **样式特点**:
  - 直观的拖拽上传界面
  - 左右对比的预览布局
  - 实时进度显示
  - 响应式网格设计
- **技术实现**:
  - 基于 Canvas API 实现图片压缩
  - 智能尺寸计算算法
  - 文件类型验证和错误处理
  - 批量处理进度追踪

#### 4. OCR 识别 (`/image/ocr-recognition`)

- **功能描述**: 图片文字识别和提取
- **开发状态**: 开发中

### 日期时间工具

#### 5. 日期计算器 (`/date/date-calculator`)

- **功能描述**: 提供全面的日期计算功能，包括日期加减、差值计算、年龄计算、倒计时等
- **主要特性**:
  - 日期加减计算：支持年、月、日的加减运算
  - 日期差值计算：计算两个日期之间的天数、周数、月数、年数
  - 工作日统计：自动排除周末，计算工作日数量
  - 年龄计算：精确计算年龄，包括总天数、小时数、分钟数
  - 生日倒计时：计算距离下次生日的天数
  - 倒计时功能：实时显示距离目标时间的剩余时间
  - 快捷操作：今天、昨天、明天等快捷按钮
  - 中文日期选择器和时区支持
- **布局结构**: 2x2 网格布局，四个功能模块独立展示
- **技术特点**: 使用 UTC+8 时区，支持实时更新，完善的错误处理

#### 6. 时间戳转换 (`/date/timestamp-converter`)

- **功能描述**: Unix 时间戳与人类可读时间的相互转换，支持多时区和批量处理
- **主要特性**:
  - 实时时间戳显示：当前时间的秒级和毫秒级时间戳
  - 时间戳转日期：支持自动识别秒级/毫秒级格式
  - 日期转时间戳：图形化日期选择器和手动输入
  - 多时区支持：北京、东京、纽约、伦敦等 8 个时区
  - 多格式输出：标准格式、ISO 格式、相对时间
  - 批量转换：支持混合输入，智能识别格式
  - 剪贴板集成：一键复制转换结果
- **布局结构**: 上中下三段式布局，当前时间、转换工具、批量处理
- **技术特点**: 默认 UTC+8 时区，中文界面，错误容错处理

#### 7. Cron 表达式工具 (`/date/cron`)

- **功能描述**: 专业的 Cron 表达式生成器和解析器，支持可视化配置和执行时间预测
- **主要特性**:
  - 可视化生成器：通过图形界面生成 Cron 表达式
    - 支持秒级、分钟级、小时级、日级、自定义模式
    - 每个时间单位支持"每个"、"间隔"、"指定"三种配置方式
    - 实时预览生成的表达式
  - 智能解析器：解析 Cron 表达式为人类可读格式
    - 表达式语法验证和错误提示
    - 字段含义详细解释
    - 下次执行时间计算
    - 未来 5 次执行时间预测
  - 常用模板库：12 种预设的常用 Cron 表达式
    - 每分钟、每小时、每天午夜、工作日等
    - 一键选择应用模板
  - 完整的时间字段支持：秒、分、时、日、月、周
- **布局结构**: 左右双栏布局，左侧生成器，右侧解析器
- **技术实现**:
  - 基于 croner 库进行 Cron 表达式处理
  - 支持标准 6 字段 Cron 格式（秒 分 时 日 月 周）
  - 智能描述生成算法
  - 中文界面和时区支持
- **样式特点**:
  - 卡片式分组布局
  - 模板网格展示
  - 实时交互反馈
  - 响应式设计

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

## 🎨 设计规范

### 色彩系统

- **主色调**: `#409eff` (Element Plus 默认蓝色)
- **成功色**: `#67c23a` (绿色)
- **警告色**: `#e6a23c` (橙色)
- **危险色**: `#f56c6c` (红色)
- **信息色**: `#909399` (灰色)

### 字体规范

- **界面字体**: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif
- **代码字体**: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace

### 布局规范

- **最大宽度**: 1400px (文本对比), 1280px (其他页面)
- **间距单位**: 8px 的倍数
- **圆角半径**: 6-8px
- **阴影**: `0 2px 8px rgba(0, 0, 0, 0.1)`

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

## 🐳 Docker 部署

### 环境要求

- Docker >= 20.0.0
- Docker Compose >= 2.0.0

### 技术架构

项目使用轻量级的 Node.js `serve` 包提供静态文件服务，相比传统的 nginx 方案更加简洁：

- ✅ **轻量级**：基于 Node.js，镜像更小
- ✅ **SPA 支持**：原生支持 Vue Router 历史模式
- ✅ **简化配置**：无需复杂的服务器配置
- ✅ **开发友好**：与开发环境技术栈一致

### 快速部署

#### 方式一：使用部署脚本（推荐）

**Windows 系统：**

```powershell
# 开发环境
.\deploy.ps1 dev

# 生产环境
.\deploy.ps1 prod
```

**Linux/macOS 系统：**

```bash
# 添加执行权限
chmod +x deploy.sh

# 开发环境
./deploy.sh dev

# 生产环境
./deploy.sh prod
```

#### 方式二：手动部署

**开发环境部署：**

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 访问应用
# http://localhost:8999
```

**生产环境部署：**

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 访问应用
# http://localhost:80
```

#### 方式三：使用预构建镜像（最简单）

如果镜像已经推送到 Docker Hub 或其他镜像仓库，可以直接使用：

```bash
# 直接拉取并启动预构建镜像
docker run -d -p 80:3000 --name tools-app yourusername/tools:latest

# 或者修改docker-compose.yml文件，将build改为image
# image: yourusername/tools:latest
# 然后直接启动
docker-compose -f docker-compose.prod.yml up -d
```

### 配置说明

#### 端口配置

- **开发环境**: `localhost:8999`
- **生产环境**: `localhost:80`

### 远程服务器部署

#### 1. 准备服务器环境

```bash
# 安装 Docker 和 Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. 上传项目文件

```bash
# 使用 git 克隆（推荐）
git clone <your-repo-url>
cd tools

# 或者使用 scp 上传
scp -r . user@your-server:/path/to/tools
```

#### 3. 部署应用

```bash
# 切换到项目目录
cd /path/to/tools

# 配置环境变量
cp env.example .env
nano .env

# 启动应用
./deploy.sh prod
```

#### 4. 配置防火墙

```bash
# 开放端口
sudo ufw allow 80

# 如果使用自定义端口
sudo ufw allow 8999
```

### 性能优化建议

- 在前方配置反向代理（如 nginx、Traefik）进行负载均衡
- 配置 CDN 加速静态资源
- serve 包已默认支持静态资源压缩
- 定期清理 Docker 镜像和容器

### 故障排除

**常见问题：**

1. **端口冲突**

   ```bash
   # 检查端口占用
   netstat -tlnp | grep :80

   # 修改端口配置
   nano docker-compose.yml
   ```

2. **容器无法启动**

   ```bash
   # 查看详细日志
   docker-compose logs web

   # 重新构建镜像
   docker-compose build --no-cache
   ```

3. **权限问题**

   ```bash
   # 添加用户到 docker 组
   sudo usermod -aG docker $USER

   # 重新登录或重新启动
   ```

## 📝 开发指南

### 添加新工具页面

1. 在 `src/views/` 对应分类目录下创建 Vue 组件
2. 在 `src/router/index.js` 中添加路由配置
3. 参考现有组件的样式和交互模式
4. 确保响应式兼容性

### 代码规范

- 使用 TypeScript 编写工具类和复杂逻辑
- 遵循 Vue 3 Composition API 模式
- 使用 Element Plus 组件，保持 UI 一致性
- 添加适当的错误处理和用户提示

### 性能优化建议

- 大文件处理时使用 Web Workers
- 实现组件懒加载
- 优化图片和资源加载
- 使用适当的缓存策略

## 🔄 版本历史

### v0.3.0 (当前版本)

- ✨ 新增图片压缩功能
- ✨ 实现基于 Canvas API 的智能图片压缩
- ✨ 支持多格式转换（JPEG、PNG、WebP）
- ✨ 添加批量处理和拖拽上传
- ✨ 实现压缩前后预览对比
- 🎨 优化图片处理 UI 设计
- 📝 完善图片压缩功能文档

### v0.2.0

- ✨ 新增文本对比功能
- ✨ 实现基于 LCS 算法的智能差异检测
- ✨ 新增文件导入导出功能
- 🎨 优化响应式布局设计
- 📝 完善项目文档

### v0.1.0

- 🎉 项目初始化
- ✨ 实现 JSON 格式化功能
- 🎨 搭建基础 UI 框架
- 📦 配置构建和开发环境

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add some amazing feature'`
4. 推送到分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🎯 未来规划

### 短期目标

- [x] 完善图片压缩功能 ✅
- [x] 实现 OCR 文字识别
- [x] 添加日期计算器
- [x] 实现时间戳转换器

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

---

> 💡 **提示**: 这是一个持续开发的项目，欢迎提交 Issues 和 Pull Requests 来帮助改进！
