<template>
  <div class="ocr-container">
    <div class="header-section">
      <div class="page-header">
        <h1 class="page-title">OCR 文字识别</h1>
        <p class="page-desc">从图片中提取文字，支持中英文识别</p>
      </div>
    </div>
    
    <el-card class="upload-area">
      <div class="upload-content" v-if="!imageUrl" @drop.prevent="handleDrop" @dragover.prevent>
        <el-icon class="upload-icon"><Upload /></el-icon>
        <div class="upload-text">拖拽文件到这里、粘贴截图或</div>
        <el-button type="primary" @click="triggerUpload">选择文件</el-button>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/bmp,image/webp,application/pdf"
          style="display: none"
          @change="handleFileChange"
        />
        <div class="upload-tip">
          支持 jpg、png、pdf 格式，单个文件最大 10MB
          <div class="paste-tip">
            <el-icon><Picture /></el-icon>
            <span>可直接按 Ctrl+V 粘贴截图</span>
          </div>
        </div>
      </div>
      
      <div v-else class="image-preview">
        <div class="preview-header">
          <el-button @click="resetImage">
            <el-icon><Back /></el-icon> 重新上传
          </el-button>
        </div>
        
        <div class="preview-processing-container">
          <!-- 左侧：图片预览区域 -->
          <div class="preview-images-container">
            <div class="preview-image-wrapper original">
              <div class="preview-image-title">原始图片</div>
              <div class="preview-image-box">
                <img :src="imageUrl" class="preview-image" />
              </div>
            </div>
            
            <div v-if="processedImageUrl" class="preview-image-wrapper processed">
              <div class="preview-image-title">处理后图片</div>
              <div class="preview-image-box">
                <img :src="processedImageUrl" class="preview-image" />
              </div>
            </div>
            
            <!-- PDF页面导航 -->
            <div v-if="isPdf && pdfPageCount > 1" class="pdf-navigation">
              <div class="pdf-navigation-info">
                <span>PDF文档 - 第 {{ currentPdfPage }}/{{ pdfPageCount }} 页</span>
              </div>
              <div class="pdf-navigation-controls">
                <el-button 
                  type="primary" 
                  size="small" 
                  :disabled="currentPdfPage <= 1" 
                  @click="changePdfPage(-1)"
                >
                  <el-icon><ArrowLeft /></el-icon> 上一页
                </el-button>
                <el-button 
                  type="primary" 
                  size="small" 
                  :disabled="currentPdfPage >= pdfPageCount" 
                  @click="changePdfPage(1)"
                >
                  下一页 <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          
          <!-- 右侧：预处理选项区域 -->
          <div class="processing-options-container">
            <div class="preprocessing-status" v-if="!showPreprocessingOptions">
              <div class="status-info">
                <div class="status-label-container">
                  <span class="status-label">图像处理</span>
                  <el-switch
                    v-model="imageSettings.enablePreprocessing"
                    @change="applyImageProcessing"
                    class="status-switch"
                    active-color="#409EFF"
                    inactive-color="#DCDFE6"
                  />
                </div>
                <el-button type="primary" v-if="imageSettings.enablePreprocessing" size="small" @click="showPreprocessingOptions = true" class="edit-preset-btn">
                  <el-icon><Edit /></el-icon>
                  <span>编辑预设</span>
                </el-button>
              </div>
              <div class="preset-status" v-if="imageSettings.enablePreprocessing">
                <el-tag type="success" effect="light" class="preset-tag">
                  <el-icon class="preset-icon"><Check /></el-icon>
                  已应用"{{ getPresetDisplayName(currentPreset) }}"预设
                </el-tag>
              </div>
            </div>
            
            <div class="preset-section" v-if="imageSettings.enablePreprocessing">
              <div class="preset-title">预设模式</div>
              <div class="preset-buttons">
                <el-button 
                  size="small" 
                  @click="applyPreset('standard')" 
                  :type="currentPreset === 'standard' ? 'primary' : ''"
                >
                  标准文档
                </el-button>
                <el-button 
                  size="small" 
                  @click="applyPreset('lowQuality')" 
                  :type="currentPreset === 'lowQuality' ? 'primary' : ''"
                >
                  低质量扫描
                </el-button>
                <el-button 
                  size="small" 
                  @click="applyPreset('lowContrast')" 
                  :type="currentPreset === 'lowContrast' ? 'primary' : ''"
                >
                  低对比度文本
                </el-button>
                <el-button 
                  size="small" 
                  @click="applyPreset('mobile')" 
                  :type="currentPreset === 'mobile' ? 'primary' : ''"
                >
                  手机拍摄
                </el-button>
                <el-button 
                  size="small" 
                  @click="applyPreset('custom')" 
                  :type="currentPreset === 'custom' ? 'primary' : ''"
                >
                  自定义
                </el-button>
              </div>
            </div>
            
            <div class="image-settings" v-if="showPreprocessingOptions">
              <div class="settings-header">
                <div class="settings-title">图像预处理选项</div>
                <el-button type="text" @click="showPreprocessingOptions = false" class="close-settings">
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
              
              <div class="settings-row">
                <span class="setting-label">灰度转换:</span>
                <el-switch v-model="imageSettings.grayscale" @change="applyImageProcessing" />
              </div>
              
              <div class="settings-row">
                <span class="setting-label">对比度:</span>
                <el-slider 
                  v-model="imageSettings.contrast" 
                  :min="0.5" 
                  :max="2.5" 
                  :step="0.1" 
                  show-stops 
                  @change="applyImageProcessing" 
                />
              </div>
              
              <div class="settings-row">
                <span class="setting-label">二值化阈值:</span>
                <el-slider 
                  v-model="imageSettings.threshold" 
                  :min="0" 
                  :max="255" 
                  :step="5" 
                  show-stops 
                  @change="applyImageProcessing" 
                />
              </div>
              
              <div class="settings-row">
                <span class="setting-label">降噪:</span>
                <el-switch v-model="imageSettings.denoise" @change="applyImageProcessing" />
              </div>
              
              <div class="settings-row" v-if="imageSettings.denoise">
                <span class="setting-label">降噪方法:</span>
                <el-select v-model="imageSettings.denoiseMethod" @change="applyImageProcessing" size="small">
                  <el-option label="中值滤波" value="median" />
                  <el-option label="高斯滤波" value="gaussian" />
                  <el-option label="双边滤波" value="bilateral" />
                </el-select>
              </div>
              
              <div class="settings-row" v-if="imageSettings.denoise && imageSettings.denoiseMethod === 'median'">
                <span class="setting-label">滤波核大小:</span>
                <el-select v-model="imageSettings.medianBlurSize" @change="applyImageProcessing" size="small">
                  <el-option label="3x3" :value="3" />
                  <el-option label="5x5" :value="5" />
                  <el-option label="7x7" :value="7" />
                </el-select>
              </div>
              
              <div class="settings-row">
                <span class="setting-label">锐化:</span>
                <el-switch v-model="imageSettings.sharpen" @change="applyImageProcessing" />
              </div>
              
              <div class="settings-row">
                <span class="setting-label">倾斜校正:</span>
                <el-switch v-model="imageSettings.deskew" @change="applyImageProcessing" />
              </div>
              
              <div class="settings-row">
                <span class="setting-label">调整大小:</span>
                <el-switch v-model="imageSettings.resize" @change="applyImageProcessing" />
              </div>
              
              <div class="settings-row" v-if="imageSettings.resize">
                <span class="setting-label">放大因子:</span>
                <el-slider 
                  v-model="imageSettings.resizeFactor" 
                  :min="1" 
                  :max="3" 
                  :step="0.1" 
                  show-stops 
                  @change="applyImageProcessing" 
                />
              </div>
            </div>
            
            <el-divider></el-divider>
            
            <div class="ocr-actions">
              <el-button type="primary" @click="startOcr" :loading="isProcessing">
                <el-icon><Reading /></el-icon> 开始识别
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    
    <el-card v-if="ocrResult" class="result-area">
      <template #header>
        <div class="result-header">
          <span>识别结果</span>
          <div class="result-actions">
            <el-button type="primary" size="small" @click="copyResult">
              <el-icon><DocumentCopy /></el-icon> 复制文本
            </el-button>
            <el-button size="small" @click="downloadResult">
              <el-icon><Download /></el-icon> 下载文本
            </el-button>
          </div>
        </div>
      </template>
      <div class="result-content">
        <el-input
          v-model="ocrResult"
          type="textarea"
          :rows="10"
          placeholder="识别结果将显示在这里"
          :autosize="{ minRows: 10, maxRows: 20 }"
          style="white-space: pre-wrap; font-family: monospace;"
        />
      </div>
    </el-card>
    
    <el-card v-if="historyList.length > 0" class="history-area">
      <template #header>
        <div class="history-header">
          <span>历史记录</span>
          <el-button type="danger" size="small" @click="clearAllHistory">
            <el-icon><Delete /></el-icon> 清空历史
          </el-button>
        </div>
      </template>
      <div class="history-list">
        <div v-for="(item, index) in historyList" :key="index" class="history-item">
          <div class="history-item-image">
            <img :src="item.imageUrl" class="history-thumbnail" />
          </div>
          <div class="history-item-info">
            <div class="history-item-name">{{ item.fileName }}</div>
            <div class="history-item-time">{{ item.time }}</div>
            <div class="history-item-result">{{ truncateText(item.result, 100) }}</div>
          </div>
          <div class="history-item-actions">
            <el-button size="small" type="primary" @click="copyHistoryResult(item.result)">
              <el-icon><DocumentCopy /></el-icon>
            </el-button>
            <el-button size="small" @click="downloadHistoryResult(item.result, item.fileName)">
              <el-icon><Download /></el-icon>
            </el-button>
            <el-button type="danger" size="small" @click="deleteHistoryItem(index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createWorker } from 'tesseract.js'
import { onBeforeUnmount } from 'vue'
import * as pdfjs from 'pdfjs-dist'

// 初始化PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

// 状态变量
const fileInput = ref(null)
const imageUrl = ref('')
const processedImageUrl = ref('')
const ocrResult = ref('')
const isProcessing = ref(false)
const historyList = ref([])
const currentFile = ref(null)
const showPreprocessingOptions = ref(false)
const currentPreset = ref('standard')
const isPdf = ref(false)
const pdfPageCount = ref(0)
const currentPdfPage = ref(1)
const isApplyingPreset = ref(false)

// 图像处理设置
const imageSettings = reactive({
  enablePreprocessing: true,
  grayscale: true,
  contrast: 1.5,
  threshold: 120,
  denoise: false,
  denoiseMethod: 'median',
  medianBlurSize: 3,
  sharpen: false,
  deskew: false,
  resize: false,
  resizeFactor: 1.5
})

// 预设配置
const presets = {
  standard: {
    grayscale: true,
    contrast: 1.3,
    threshold: 130,
    denoise: false,
    sharpen: true,
    deskew: true,
    resize: false,
    resizeFactor: 1.0
  },
  lowQuality: {
    grayscale: true,
    contrast: 1.9,
    threshold: 110,
    denoise: true,
    denoiseMethod: 'median',
    medianBlurSize: 3,
    sharpen: true,
    deskew: true,
    resize: true,
    resizeFactor: 1.5
  },
  mobile: {
    grayscale: true,
    contrast: 1.7,
    threshold: 90,
    denoise: true,
    denoiseMethod: 'gaussian',
    sharpen: true,
    deskew: true,
    resize: true,
    resizeFactor: 1.3
  },
  lowContrast: {
    grayscale: true,
    contrast: 2.2,
    threshold: 70,
    denoise: true,
    denoiseMethod: 'bilateral',
    sharpen: true,
    deskew: true,
    resize: true,
    resizeFactor: 1.8
  }
}

// 应用预设
const applyPreset = (presetName) => {
  // 如果点击的是当前已选中的预设，不做任何操作
  if (currentPreset.value === presetName) {
    return
  }
  
  // 设置标志位，表示正在应用预设
  isApplyingPreset.value = true
  
  // 先设置当前预设名称
  currentPreset.value = presetName
  
  if (presetName === 'custom') {
    // 自定义模式时，打开编辑预设选项
    showPreprocessingOptions.value = true
    isApplyingPreset.value = false
    return
  }
  
  const preset = presets[presetName]
  if (!preset) {
    isApplyingPreset.value = false
    return
  }
  
  // 应用预设参数
  Object.keys(preset).forEach(key => {
    imageSettings[key] = preset[key]
  })
  
  // 确保预处理已启用
  imageSettings.enablePreprocessing = true
  
  // 应用图像处理
  applyImageProcessing()
  
  // 显示成功消息
  ElMessage.success(`已应用"${getPresetDisplayName(presetName)}"预设`)
  
  // 重置标志位
  setTimeout(() => {
    isApplyingPreset.value = false
  }, 100)
}

// 获取预设显示名称
const getPresetDisplayName = (presetName) => {
  const names = {
    standard: '标准文档',
    lowQuality: '低质量扫描',
    mobile: '手机拍摄',
    lowContrast: '低对比度文本',
    custom: '自定义'
  }
  return names[presetName] || presetName
}

// 监听设置变化，自动切换到自定义模式
watch(imageSettings, () => {
  // 如果正在应用预设，不切换到自定义模式
  if (isApplyingPreset.value) return
  
  if (currentPreset.value !== 'custom') {
    const currentSettings = JSON.stringify(imageSettings)
    const presetSettings = JSON.stringify({...presets[currentPreset.value], enablePreprocessing: imageSettings.enablePreprocessing})
    
    if (currentSettings !== presetSettings) {
      currentPreset.value = 'custom'
    }
  }
}, { deep: true })

// 触发文件选择
const triggerUpload = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

// 处理拖拽
const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

// 处理文件
const processFile = async (file) => {
  // 检查文件类型
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'application/pdf']
  if (!validTypes.includes(file.type)) {
    ElMessage.error('不支持的文件类型，请上传图片或PDF文件')
    return
  }
  
  // 检查文件大小
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过10MB')
    return
  }
  
  // 保存当前文件
  currentFile.value = file
  
  // 重置PDF相关状态
  isPdf.value = file.type === 'application/pdf'
  pdfPageCount.value = 0
  currentPdfPage.value = 1
  
  try {
    if (isPdf.value) {
      // 处理PDF文件
      await processPdfFile(file)
    } else {
      // 处理图片文件
      processImageFile(file)
    }
  } catch (error) {
    console.error('文件处理失败:', error)
    ElMessage.error(`文件处理失败: ${error.message || '未知错误'}`)
    resetImage()
  }
}

// 处理图片文件
const processImageFile = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target.result
    // 应用图像预处理
    if (imageSettings.enablePreprocessing) {
      applyImageProcessing()
    } else {
      processedImageUrl.value = ''
    }
  }
  reader.readAsDataURL(file)
}

// 处理PDF文件
const processPdfFile = async (file) => {
  try {
    // 读取PDF文件
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    
    // 获取PDF页数
    pdfPageCount.value = pdf.numPages
    
    // 渲染第一页
    await renderPdfPage(pdf, 1)
    
    ElMessage.success(`PDF文件加载成功，共${pdfPageCount.value}页`)
  } catch (error) {
    console.error('PDF处理失败:', error)
    ElMessage.error('PDF处理失败，请检查文件是否有效')
    throw error
  }
}

// 渲染PDF页面
const renderPdfPage = async (pdf, pageNumber) => {
  try {
    // 获取指定页面
    const page = await pdf.getPage(pageNumber)
    
    // 设置缩放比例
    const viewport = page.getViewport({ scale: 1.5 })
    
    // 创建Canvas
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width
    
    // 渲染PDF页面到Canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise
    
    // 转换为图像URL
    imageUrl.value = canvas.toDataURL('image/png')
    
    // 更新当前页码
    currentPdfPage.value = pageNumber
    
    // 应用图像预处理
    if (imageSettings.enablePreprocessing) {
      applyImageProcessing()
    } else {
      processedImageUrl.value = ''
    }
  } catch (error) {
    console.error('PDF页面渲染失败:', error)
    ElMessage.error(`PDF页面渲染失败: ${error.message || '未知错误'}`)
    throw error
  }
}

// 切换PDF页面
const changePdfPage = async (direction) => {
  if (!isPdf.value || !currentFile.value) return
  
  const newPage = currentPdfPage.value + direction
  if (newPage < 1 || newPage > pdfPageCount.value) return
  
  try {
    // 读取PDF文件
    const arrayBuffer = await currentFile.value.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    
    // 渲染新页面
    await renderPdfPage(pdf, newPage)
  } catch (error) {
    console.error('PDF页面切换失败:', error)
    ElMessage.error('PDF页面切换失败，请重试')
  }
}

// 应用图像预处理
const applyImageProcessing = async () => {
  if (!imageUrl.value || !imageSettings.enablePreprocessing) {
    processedImageUrl.value = ''
    return
  }
  
  try {
    // 创建图像元素
    const img = new Image()
    img.src = imageUrl.value
    
    await new Promise((resolve) => {
      img.onload = resolve
    })
    
    // 创建Canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // 调整大小
    let width = img.width
    let height = img.height
    
    if (imageSettings.resize) {
      width = Math.floor(width * imageSettings.resizeFactor)
      height = Math.floor(height * imageSettings.resizeFactor)
    }
    
    canvas.width = width
    canvas.height = height
    
    // 绘制原始图像
    ctx.drawImage(img, 0, 0, width, height)
    
    // 获取图像数据
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let data = imageData.data
    
    // 灰度转换
    if (imageSettings.grayscale) {
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        data[i] = data[i + 1] = data[i + 2] = gray
      }
    }
    
    // 应用对比度
    if (imageSettings.contrast !== 1) {
      const factor = (259 * (imageSettings.contrast * 100 + 255)) / (255 * (259 - imageSettings.contrast * 100))
      for (let i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128
        data[i + 1] = factor * (data[i + 1] - 128) + 128
        data[i + 2] = factor * (data[i + 2] - 128) + 128
      }
    }
    
    // 更新图像数据
    ctx.putImageData(imageData, 0, 0)
    
    // 应用降噪
    if (imageSettings.denoise) {
      // 保存当前图像
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = canvas.width
      tempCanvas.height = canvas.height
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.drawImage(canvas, 0, 0)
      
      // 清除原始画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 应用不同的滤波方法
      if (imageSettings.denoiseMethod === 'median') {
        // 中值滤波
        applyMedianFilter(tempCtx, ctx, canvas.width, canvas.height, imageSettings.medianBlurSize)
      } else if (imageSettings.denoiseMethod === 'gaussian') {
        // 高斯滤波 (简化版)
        applyGaussianBlur(tempCtx, ctx, canvas.width, canvas.height)
      } else if (imageSettings.denoiseMethod === 'bilateral') {
        // 双边滤波 (简化版)
        applyBilateralFilter(tempCtx, ctx, canvas.width, canvas.height)
      }
    }
    
    // 应用锐化
    if (imageSettings.sharpen) {
      applySharpen(ctx, canvas.width, canvas.height)
    }
    
    // 应用倾斜校正 (简化版)
    if (imageSettings.deskew) {
      // 实际应用中，这里需要更复杂的算法来检测和校正文本倾斜
      // 这里只是一个占位符
    }
    
    // 二值化
    if (imageSettings.threshold > 0) {
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      data = imageData.data
      
      for (let i = 0; i < data.length; i += 4) {
        const value = data[i] < imageSettings.threshold ? 0 : 255
        data[i] = data[i + 1] = data[i + 2] = value
      }
      
      // 更新图像数据
      ctx.putImageData(imageData, 0, 0)
    }
    
    // 转换为DataURL
    processedImageUrl.value = canvas.toDataURL('image/png')
  } catch (error) {
    console.error('图像处理失败:', error)
    ElMessage.error('图像处理失败，请重试')
    processedImageUrl.value = ''
  }
}

// 中值滤波实现
const applyMedianFilter = (srcCtx, dstCtx, width, height, kernelSize) => {
  const srcData = srcCtx.getImageData(0, 0, width, height).data
  const dstData = dstCtx.getImageData(0, 0, width, height)
  const dstPixels = dstData.data
  
  const halfKernel = Math.floor(kernelSize / 2)
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      
      // 对每个颜色通道应用中值滤波
      for (let c = 0; c < 3; c++) {
        const values = []
        
        // 收集核内的像素值
        for (let ky = -halfKernel; ky <= halfKernel; ky++) {
          for (let kx = -halfKernel; kx <= halfKernel; kx++) {
            const ny = Math.min(Math.max(y + ky, 0), height - 1)
            const nx = Math.min(Math.max(x + kx, 0), width - 1)
            const nidx = (ny * width + nx) * 4
            values.push(srcData[nidx + c])
          }
        }
        
        // 排序并取中值
        values.sort((a, b) => a - b)
        dstPixels[idx + c] = values[Math.floor(values.length / 2)]
      }
      
      // Alpha通道保持不变
      dstPixels[idx + 3] = 255
    }
  }
  
  dstCtx.putImageData(dstData, 0, 0)
}

// 高斯滤波实现 (简化版)
const applyGaussianBlur = (srcCtx, dstCtx, width, height) => {
  // 在实际应用中，这里应该实现完整的高斯滤波
  // 这里使用简化版本
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = width
  tempCanvas.height = height
  const tempCtx = tempCanvas.getContext('2d')
  
  // 绘制源图像
  tempCtx.drawImage(srcCtx.canvas, 0, 0)
  
  // 应用模糊
  dstCtx.filter = 'blur(1px)'
  dstCtx.drawImage(tempCanvas, 0, 0)
  dstCtx.filter = 'none'
}

// 双边滤波实现 (简化版)
const applyBilateralFilter = (srcCtx, dstCtx, width, height) => {
  // 在实际应用中，这里应该实现完整的双边滤波
  // 这里使用简化版本，先应用高斯模糊，然后增强边缘
  applyGaussianBlur(srcCtx, dstCtx, width, height)
  
  // 增强边缘
  const imageData = dstCtx.getImageData(0, 0, width, height)
  const data = imageData.data
  
  for (let i = 0; i < data.length; i += 4) {
    // 简单的边缘增强
    if (i > 0 && i < data.length - 4) {
      const diff = Math.abs(data[i] - data[i - 4])
      if (diff > 20) {
        data[i] = data[i - 4] > data[i] ? 0 : 255
        data[i + 1] = data[i]
        data[i + 2] = data[i]
      }
    }
  }
  
  dstCtx.putImageData(imageData, 0, 0)
}

// 锐化实现
const applySharpen = (ctx, width, height) => {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const tempData = new Uint8ClampedArray(data)
  
  // 锐化卷积核
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ]
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4
      
      // 对每个颜色通道应用锐化
      for (let c = 0; c < 3; c++) {
        let sum = 0
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const kidx = ((ky + 1) * 3 + (kx + 1))
            const nidx = ((y + ky) * width + (x + kx)) * 4
            sum += tempData[nidx + c] * kernel[kidx]
          }
        }
        
        data[idx + c] = Math.min(Math.max(sum, 0), 255)
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0)
}

// 重置图片
const resetImage = () => {
  imageUrl.value = ''
  processedImageUrl.value = ''
  ocrResult.value = ''
  currentFile.value = null
  fileInput.value.value = ''
}

// 开始OCR识别
const startOcr = async () => {
  if (!imageUrl.value) {
    ElMessage.warning('请先上传图片')
    return
  }
  
  isProcessing.value = true
  ocrResult.value = ''
  
  try {
    // 创建Tesseract Worker
    const worker = await createWorker('chi_sim+eng')
    
    // 识别图片（使用预处理后的图片或原图）
    const sourceImage = imageSettings.enablePreprocessing && processedImageUrl.value 
      ? processedImageUrl.value 
      : imageUrl.value
    
    // 设置识别参数
    const ocrParams = {
      tessedit_pageseg_mode: '6', // 假设单个文本块
      preserve_interword_spaces: '1',
      preserve_newlines: '1', // 保留换行符
    }
    
    await worker.setParameters(ocrParams)
    
    // 识别图片
    const { data } = await worker.recognize(sourceImage)
    
    // 处理结果
    let recognizedText = data.text
    
    // 确保结果不为空
    if (!recognizedText || recognizedText.trim() === '') {
      ElMessage.warning('未能识别出文字，请尝试调整图像或预处理设置')
      ocrResult.value = '未能识别出文字，请尝试：\n1. 调整图像预处理参数\n2. 提高图像质量\n3. 确保图像中包含清晰文字'
    } else {
      // 如果是PDF，添加页码信息
      if (isPdf.value && pdfPageCount.value > 1) {
        recognizedText = `【第 ${currentPdfPage.value}/${pdfPageCount.value} 页】\n\n${recognizedText}`
      }
      
      // 保留原始格式
      ocrResult.value = recognizedText
      
      // 添加到历史记录
      addToHistory()
      
      ElMessage.success('识别完成')
    }
    
    // 终止Worker
    await worker.terminate()
  } catch (error) {
    console.error('OCR识别失败:', error)
    ElMessage.error(`识别失败: ${error.message || '请重试'}`)
    ocrResult.value = `识别过程中出错: ${error.message || '未知错误'}\n请重试或调整设置`
  } finally {
    isProcessing.value = false
  }
}

// 添加到历史记录
const addToHistory = () => {
  if (!currentFile.value || !ocrResult.value) return
  
  const now = new Date()
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  
  // 构建文件名
  let fileName = currentFile.value.name
  if (isPdf.value && pdfPageCount.value > 1) {
    fileName = `${fileName} (第${currentPdfPage.value}页)`
  }
  
  historyList.value.unshift({
    fileName: fileName,
    imageUrl: imageUrl.value,
    result: ocrResult.value,
    time: timeStr
  })
  
  // 限制历史记录数量
  if (historyList.value.length > 5) {
    historyList.value = historyList.value.slice(0, 5)
  }
  
  // 保存到本地存储
  saveHistoryToLocalStorage()
}

// 保存历史记录到本地存储
const saveHistoryToLocalStorage = () => {
  try {
    localStorage.setItem('ocrHistory', JSON.stringify(historyList.value))
  } catch (error) {
    console.error('保存历史记录失败:', error)
  }
}

// 从本地存储加载历史记录
const loadHistoryFromLocalStorage = () => {
  try {
    const savedHistory = localStorage.getItem('ocrHistory')
    if (savedHistory) {
      historyList.value = JSON.parse(savedHistory)
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

// 复制结果
const copyResult = () => {
  if (!ocrResult.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  
  navigator.clipboard.writeText(ocrResult.value)
    .then(() => {
      ElMessage.success('已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}

// 下载结果
const downloadResult = () => {
  if (!ocrResult.value) {
    ElMessage.warning('没有可下载的内容')
    return
  }
  
  const blob = new Blob([ocrResult.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `OCR结果_${new Date().getTime()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 复制历史结果
const copyHistoryResult = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      ElMessage.success('已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}

// 下载历史结果
const downloadHistoryResult = (text, fileName) => {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `OCR结果_${fileName.split('.')[0]}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 截断文本
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// 组件挂载时加载历史记录
onMounted(() => {
  loadHistoryFromLocalStorage()
  // 添加粘贴事件监听
  document.addEventListener('paste', handlePaste)
})

// 组件卸载前移除事件监听
onBeforeUnmount(() => {
  document.removeEventListener('paste', handlePaste)
})

// 处理粘贴事件
const handlePaste = (event) => {
  const items = (event.clipboardData || window.clipboardData).items
  
  if (!items) return
  
  // 查找剪贴板中的图片
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      // 获取粘贴的图片文件
      const file = items[i].getAsFile()
      if (file) {
        ElMessage.success('已从剪贴板获取图片')
        processFile(file)
        break
      }
    }
  }
}

// 删除单条历史记录
const deleteHistoryItem = (index) => {
  ElMessage.success('已删除历史记录')
  historyList.value.splice(index, 1)
  saveHistoryToLocalStorage()
}

// 清空所有历史记录
const clearAllHistory = () => {
  ElMessageBox.confirm('确定要清空所有历史记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    historyList.value = []
    saveHistoryToLocalStorage()
    ElMessage.success('已清空所有历史记录')
  }).catch(() => {
    // 用户取消操作
  })
}
</script>

<style scoped>
.ocr-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.page-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 0;
}

.upload-area {
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-content:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.upload-icon {
  font-size: 64px;
  color: #409eff;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 16px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 16px;
  text-align: center;
}

.paste-tip {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
}

.paste-tip .el-icon {
  margin-right: 4px;
}

.image-preview {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0;
}

.preview-header {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
  padding: 0 16px;
}

.preview-processing-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 20px;
}

.preview-images-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-image-wrapper {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.preview-image-title {
  padding: 10px;
  font-weight: bold;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
  color: #606266;
}

.preview-image-box {
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}

.preview-image {
  max-width: 100%;
  max-height: 250px;
  border-radius: 4px;
}

.preview-image-wrapper.processed .preview-image-title {
  color: #409eff;
  background-color: #ecf5ff;
}

.processing-options-container {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preprocessing-status {
  width: 100%;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
}

.preprocessing-status:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.status-info {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.status-label-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-label {
  font-size: 15px;
  color: #303133;
  font-weight: 600;
}

.status-switch {
  margin-left: 8px;
}

.preset-status {
  display: flex;
  align-items: center;
  margin: 8px 0;
}

.preset-tag {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 4px;
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
  color: #67c23a;
  font-size: 13px;
}

.preset-icon {
  margin-right: 6px;
  font-size: 14px;
  color: #67c23a;
}

.edit-preset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.3s ease;
  background-color: #409eff;
  border-color: #409eff;
}

.edit-preset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.image-settings {
  width: 100%;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  position: relative;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.settings-title {
  font-weight: bold;
  color: #303133;
}

.close-settings {
  padding: 4px;
  border-radius: 50%;
}

.settings-group {
  margin-top: 16px;
}

.settings-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.setting-label {
  width: 100px;
  font-size: 14px;
  color: #606266;
}

.ocr-actions {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.result-area {
  margin-bottom: 24px;
  border-radius: 8px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.result-content {
  padding: 10px 0;
}

.history-area {
  margin-bottom: 24px;
  border-radius: 8px;
}

.history-header {
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 0;
}

.history-item {
  display: flex;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  background-color: #fff;
  transition: all 0.3s;
  align-items: center;
}

.history-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.history-item-image {
  width: 80px;
  height: 80px;
  margin-right: 16px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.history-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-item-info {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 80px;
}

.history-item-name {
  font-weight: bold;
  margin-bottom: 4px;
  color: #303133;
  font-size: 15px;
}

.history-item-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.history-item-result {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
}

.history-item-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 16px;
  align-items: flex-end;
}

.history-item-actions .el-button {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .preview-processing-container {
    flex-direction: column;
  }
  
  .processing-options-container {
    width: 100%;
  }
}

.preset-section {
  margin: 16px 0;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.preset-title {
  font-weight: bold;
  margin-bottom: 12px;
  color: #606266;
  font-size: 14px;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: left;
}

.preset-buttons .el-button {
  margin-right: 0;
}

.pdf-navigation {
  margin-top: 16px;
  padding: 12px;
  background-color: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #a0cfff;
}

.pdf-navigation-info {
  margin-bottom: 12px;
  text-align: center;
  font-weight: bold;
  color: #409eff;
}

.pdf-navigation-controls {
  display: flex;
  justify-content: space-between;
}
</style>