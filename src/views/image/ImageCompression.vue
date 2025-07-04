<template>
  <div class="image-compression">
    <!-- 页面标题 -->
    <div class="header-section">
      <div class="page-header">
        <h1 class="page-title">图片压缩</h1>
        <p class="page-desc">支持JPG、PNG、WebP格式图片压缩，可调节质量和尺寸，保持高质量的同时减小文件大小</p>
      </div>
    </div>

    <!-- 上传区域 -->
    <div class="upload-section">
      <el-card>
        <template #header>
          <div class="section-header">
            <el-icon><Upload /></el-icon>
            <span>上传图片</span>
          </div>
        </template>
        
        <el-upload
          ref="uploadRef"
          class="upload-dragger"
          drag
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          multiple
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将图片拖拽到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 JPG、PNG、GIF、WebP 格式，单个文件不超过 50MB
            </div>
          </template>
        </el-upload>

        <!-- 已上传的文件列表 -->
        <div v-if="uploadedFiles.length > 0" class="uploaded-files">
          <div class="files-header">
            <span>已上传 {{ uploadedFiles.length }} 个文件</span>
            <el-button size="small" @click="clearFiles" link type="danger">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
          </div>
          <div class="files-list">
            <div 
              v-for="(file, index) in uploadedFiles" 
              :key="index"
              class="file-item"
              :class="{ active: selectedFileIndex === index }"
              @click="selectFile(index)"
            >
              <div class="file-preview">
                <img :src="file.preview" :alt="file.file.name" />
              </div>
              <div class="file-info">
                <div class="file-name">{{ file.file.name }}</div>
                <div class="file-size">{{ formatFileSize(file.file.size) }}</div>
              </div>
              <el-button size="small" @click.stop="removeFile(index)" link type="danger">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 压缩设置和操作区域 -->
    <div v-if="uploadedFiles.length > 0" class="settings-section">
      <el-row :gutter="20">
        <!-- 压缩设置面板 -->
        <el-col :xs="24" :sm="24" :md="8">
          <el-card>
            <template #header>
              <div class="section-header">
                <el-icon><Setting /></el-icon>
                <span>压缩设置</span>
              </div>
            </template>
            
            <div class="setting-group">
              <label class="setting-label">输出格式</label>
              <el-select v-model="compressOptions.outputFormat" style="width: 100%">
                <el-option label="JPEG" value="image/jpeg" />
                <el-option label="PNG" value="image/png" />
                <el-option label="WebP" value="image/webp" />
              </el-select>
            </div>

            <div class="setting-group">
              <label class="setting-label">
                压缩质量 ({{ Math.round((compressOptions.quality ?? 0) * 100) }}%)
              </label>
              <el-slider
                v-model="qualitySlider"
                :min="10"
                :max="100"
                :step="5"
                show-stops
                @change="updateQuality"
              />
              <div class="quality-tips">
                <span class="tip-item">高质量 (80-100%)</span>
                <span class="tip-item">中等质量 (50-80%)</span>
                <span class="tip-item">低质量 (10-50%)</span>
              </div>
            </div>

            <div class="setting-group">
              <label class="setting-label">尺寸调整</label>
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-input
                    v-model.number="compressOptions.maxWidth"
                    placeholder="最大宽度"
                    type="number"
                  >
                    <template #append>px</template>
                  </el-input>
                </el-col>
                <el-col :span="12">
                  <el-input
                    v-model.number="compressOptions.maxHeight"
                    placeholder="最大高度"
                    type="number"
                  >
                    <template #append>px</template>
                  </el-input>
                </el-col>
              </el-row>
              <div class="setting-tips">
                <el-checkbox v-model="compressOptions.maintainAspectRatio">
                  保持宽高比
                </el-checkbox>
              </div>
            </div>

            <div class="action-buttons">
              <el-button 
                type="primary" 
                @click="compressImages"
                :loading="isCompressing"
                :disabled="uploadedFiles.length === 0"
                block
              >
                <el-icon><Position /></el-icon>
                {{ isCompressing ? '压缩中...' : '开始压缩' }}
              </el-button>
              
              <el-button 
                v-if="compressedResults.length > 0"
                @click="downloadAll"
                block
              >
                <el-icon><Download /></el-icon>
                下载全部
              </el-button>
            </div>
          </el-card>
        </el-col>

        <!-- 预览和结果区域 -->
        <el-col :xs="24" :sm="24" :md="16">
          <el-card>
            <template #header>
              <div class="section-header">
                <el-icon><View /></el-icon>
                <span>预览对比</span>
                <div v-if="selectedFileIndex >= 0" class="header-actions">
                  <span class="current-file">
                    {{ selectedFileIndex + 1 }} / {{ uploadedFiles.length }}
                  </span>
                </div>
              </div>
            </template>

            <!-- 压缩进度 -->
            <div v-if="isCompressing" class="progress-section">
              <div class="progress-info">
                <span>正在压缩第 {{ compressionProgress.current }} / {{ compressionProgress.total }} 张图片</span>
                <span>{{ Math.round(compressionProgress.current / compressionProgress.total * 100) }}%</span>
              </div>
              <el-progress 
                :percentage="Math.round(compressionProgress.current / compressionProgress.total * 100)"
                :stroke-width="6"
              />
            </div>

            <!-- 图片预览对比 -->
            <div v-if="selectedFileIndex >= 0" class="preview-section">
              <div class="preview-container">
                <!-- 原图预览 -->
                <div class="preview-item">
                  <div class="preview-header">
                    <span class="preview-title">原图</span>
                    <span class="preview-info">
                      {{ getCurrentImageInfo()?.width || 0 }} × {{ getCurrentImageInfo()?.height || 0 }}
                      ({{ formatFileSize(getCurrentImageInfo()?.size || 0) }})
                    </span>
                  </div>
                  <div class="preview-image">
                    <img 
                      :src="uploadedFiles[selectedFileIndex]?.preview" 
                      :alt="uploadedFiles[selectedFileIndex]?.file.name"
                    />
                  </div>
                </div>

                <!-- 压缩后预览 -->
                <div class="preview-item">
                  <div class="preview-header">
                    <span class="preview-title">压缩后</span>
                    <span v-if="getCurrentCompressedResult()" class="preview-info">
                      {{ getCurrentCompressedResult()?.compressedImage.width || 0 }} × 
                      {{ getCurrentCompressedResult()?.compressedImage.height || 0 }}
                      ({{ formatFileSize(getCurrentCompressedResult()?.compressedImage.size || 0) }})
                    </span>
                  </div>
                  <div class="preview-image">
                    <img 
                      v-if="getCurrentCompressedResult()"
                      :src="getCurrentCompressedResult()?.compressedImage.dataUrl"
                      :alt="`${uploadedFiles[selectedFileIndex]?.file.name}_compressed`"
                    />
                    <div v-else class="preview-placeholder">
                      <el-icon><Picture /></el-icon>
                      <span>请先进行压缩</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 压缩统计信息 -->
              <div v-if="getCurrentCompressedResult()" class="stats-section">
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-label">压缩比例</div>
                    <div class="stat-value">
                      {{ 
                        isNaN(getCurrentCompressedResult()!.compressionRatio) 
                          ? '计算错误' 
                          : Math.round((1 - getCurrentCompressedResult()!.compressionRatio) * 100) + '%'
                      }}
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">大小减少</div>
                    <div class="stat-value">
                      {{ getCurrentCompressedResult()!.sizeDifference >= 0 
                         ? formatFileSize(getCurrentCompressedResult()!.sizeDifference)
                         : `-${formatFileSize(Math.abs(getCurrentCompressedResult()!.sizeDifference))}`
                      }}
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">质量设置</div>
                    <div class="stat-value">{{ Math.round((compressOptions.quality ?? 0) * 100) }}%</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">输出格式</div>
                    <div class="stat-value">{{ compressOptions.outputFormat?.split('/')[1].toUpperCase() }}</div>
                  </div>
                </div>
                
                <div class="download-actions">
                  <el-button @click="downloadSingle(selectedFileIndex)">
                    <el-icon><Download /></el-icon>
                    下载此图片
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="empty-preview">
              <el-empty description="请上传图片开始压缩" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Upload, 
  UploadFilled, 
  Delete, 
  Close, 
  Setting, 
  Position, 
  Download, 
  View, 
  Picture 
} from '@element-plus/icons-vue'
import { ImageUtils, type CompressOptions, type CompressResult, type ImageInfo } from '@/utils/ImageUtils'

// 响应式数据
const uploadRef = ref()
const uploadedFiles = ref<{ file: File; preview: string; info?: ImageInfo }[]>([])
const selectedFileIndex = ref<number>(-1)
const compressedResults = ref<CompressResult[]>([])
const isCompressing = ref<boolean>(false)
const qualitySlider = ref<number>(80)

// 压缩选项
const compressOptions = reactive<CompressOptions>({
  quality: 0.8,
  outputFormat: 'image/jpeg',
  maintainAspectRatio: true
})

// 压缩进度
const compressionProgress = reactive({
  current: 0,
  total: 0
})

// 方法
const handleFileChange = async (file: any) => {
  const fileObj = file.raw
  if (!fileObj) return

  // 验证文件
  const validation = ImageUtils.validateImageFile(fileObj)
  if (!validation.valid) {
    ElMessage.error(validation.message)
    return
  }

  try {
    // 创建预览
    const preview = await ImageUtils.createImagePreview(fileObj)
    const info = await ImageUtils.getImageInfo(fileObj)
    
    uploadedFiles.value.push({
      file: fileObj,
      preview,
      info
    })

    // 选中新上传的文件
    selectedFileIndex.value = uploadedFiles.value.length - 1
    
    ElMessage.success('图片上传成功')
  } catch (error) {
    console.error('处理图片失败:', error)
    ElMessage.error('图片处理失败')
  }
}

const beforeUpload = (file: File) => {
  const validation = ImageUtils.validateImageFile(file)
  if (!validation.valid) {
    ElMessage.error(validation.message)
    return false
  }
  return true
}

const selectFile = (index: number) => {
  selectedFileIndex.value = index
}

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1)
  compressedResults.value.splice(index, 1)
  
  if (selectedFileIndex.value >= uploadedFiles.value.length) {
    selectedFileIndex.value = uploadedFiles.value.length - 1
  }
  
  if (uploadedFiles.value.length === 0) {
    selectedFileIndex.value = -1
  }
}

const clearFiles = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有文件吗？', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    uploadedFiles.value = []
    compressedResults.value = []
    selectedFileIndex.value = -1
    ElMessage.success('已清空所有文件')
  } catch {
    // 用户取消操作
  }
}

const updateQuality = (value: number) => {
  compressOptions.quality = value / 100
}

const compressImages = async () => {
  if (uploadedFiles.value.length === 0) return

  isCompressing.value = true
  compressionProgress.current = 0
  compressionProgress.total = uploadedFiles.value.length
  compressedResults.value = []

  try {
    const files = uploadedFiles.value.map(item => item.file)
    const results = await ImageUtils.compressBatch(
      files,
      compressOptions,
      (completed, total) => {
        compressionProgress.current = completed
        compressionProgress.total = total
      }
    )

    compressedResults.value = results
    ElMessage.success(`成功压缩 ${results.length} 张图片`)
  } catch (error) {
    console.error('批量压缩失败:', error)
    ElMessage.error('压缩过程中出现错误')
  } finally {
    isCompressing.value = false
  }
}

const downloadSingle = (index: number) => {
  const result = compressedResults.value[index]
  if (result) {
    ImageUtils.downloadFile(result.compressedImage.file)
    ElMessage.success('下载开始')
  }
}

const downloadAll = () => {
  if (compressedResults.value.length === 0) return

  // 依次下载所有压缩后的图片
  compressedResults.value.forEach((result, index) => {
    setTimeout(() => {
      ImageUtils.downloadFile(result.compressedImage.file)
    }, index * 100) // 间隔100ms避免浏览器限制
  })

  ElMessage.success(`开始下载 ${compressedResults.value.length} 张图片`)
}

const formatFileSize = ImageUtils.formatFileSize

// 计算属性
const getCurrentImageInfo = (): ImageInfo | undefined => {
  return uploadedFiles.value[selectedFileIndex.value]?.info
}

const getCurrentCompressedResult = (): CompressResult | undefined => {
  return compressedResults.value[selectedFileIndex.value]
}
</script>

<style scoped>
.image-compression {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-section {
  margin-bottom: 20px;
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

.upload-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.header-actions {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-secondary);
}

.upload-dragger {
  width: 100%;
}

.uploaded-files {
  margin-top: 20px;
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--text-regular);
}

.files-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--border-lighter);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.file-item:hover {
  border-color: var(--primary-color);
  background: #f0f9ff;
}

.file-item.active {
  border-color: var(--primary-color);
  background: #ecf5ff;
}

.file-preview {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 12px;
}

.file-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.settings-section {
  margin-bottom: 20px;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-regular);
}

.quality-tips {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.setting-tips {
  margin-top: 8px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 取消Element Plus默认的按钮间距 */
.action-buttons .el-button + .el-button {
  margin-left: 0;
}

/* .action-buttons .el-button {
  width: 100%;
  height: 40px;
  font-size: 14px;
} */

.progress-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-regular);
}

.preview-section {
  margin-bottom: 20px;
}

.preview-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.preview-item {
  border: 1px solid var(--border-lighter);
  border-radius: 6px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid var(--border-lighter);
}

.preview-title {
  font-weight: 500;
  color: var(--text-primary);
}

.preview-info {
  font-size: 12px;
  color: var(--text-secondary);
}

.preview-image {
  position: relative;
  aspect-ratio: 16/9;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-secondary);
  gap: 8px;
}

.preview-placeholder .el-icon {
  font-size: 32px;
}

.stats-section {
  margin-top: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: var(--primary-color);
}

.download-actions {
  text-align: center;
}

.empty-preview {
  padding: 40px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview-container {
    grid-template-columns: 1fr;
  }
  
  .files-list {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .image-compression {
    padding: 0 10px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style> 