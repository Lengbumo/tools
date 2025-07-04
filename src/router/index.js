import { createRouter, createWebHistory } from 'vue-router'

// 图片工具
const OcrRecognition = () => import('../views/image/OcrRecognition.vue')
const ImageCompression = () => import('../views/image/ImageCompression.vue')
const QrGenerator = () => import('../views/image/QrGenerator.vue')
const Base64Converter = () => import('../views/image/Base64Converter.vue')

// 文本工具
const JsonFormatter = () => import('../views/text/JsonFormatter.vue')
const TextComparison = () => import('../views/text/TextComparison.vue')

// 视频工具
const VideoCompression = () => import('../views/video/VideoCompression.vue')

// 日期工具
const TimestampConverter = () => import('../views/date/TimestampConverter.vue')
const DateCalculator = () => import('../views/date/DateCalculator.vue')
const CronExpression = () => import('../views/date/CronExpression.vue')

const routes = [
  {
    path: '/',
    redirect: '/image/ocr'
  },
  {
    path: '/image/ocr',
    name: 'OcrRecognition',
    component: OcrRecognition,
    meta: { title: 'OCR文字识别' }
  },
  {
    path: '/image/compression',
    name: 'ImageCompression',
    component: ImageCompression,
    meta: { title: '图片压缩' }
  },
  {
    path: '/image/qr-generator',
    name: 'QrGenerator',
    component: QrGenerator,
    meta: { title: '二维码生成' }
  },
  {
    path: '/image/base64-converter',
    name: 'Base64Converter',
    component: Base64Converter,
    meta: { title: 'Base64转换' }
  },
  {
    path: '/text/json',
    name: 'JsonFormatter',
    component: JsonFormatter,
    meta: { title: 'JSON格式化' }
  },
  {
    path: '/text/comparison',
    name: 'TextComparison',
    component: TextComparison,
    meta: { title: '文本对比' }
  },
  {
    path: '/video/compression',
    name: 'VideoCompression',
    component: VideoCompression,
    meta: { title: '视频压缩' }
  },
  {
    path: '/date/timestamp',
    name: 'TimestampConverter',
    component: TimestampConverter,
    meta: { title: '时间戳转换' }
  },
  {
    path: '/date/calculator',
    name: 'DateCalculator',
    component: DateCalculator,
    meta: { title: '日期计算' }
  },
  {
    path: '/date/cron',
    name: 'CronExpression',
    component: CronExpression,
    meta: { title: 'Cron表达式' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 工具箱` : '在线工具箱'
  next()
})

export default router 