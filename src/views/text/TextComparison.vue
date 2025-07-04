<template>
  <div class="text-comparison">
    <!-- 页面标题和工具栏 -->
    <div class="header-section">
      <div class="page-header">
        <h1 class="page-title">文本对比</h1>
        <p class="page-desc">支持文本的逐行对比，高亮显示差异内容，提供详细的统计信息</p>
      </div>
      
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-group">
          <el-tooltip content="开始对比" placement="top">
            <el-button type="primary" @click="compareTexts" :disabled="!leftText.trim() && !rightText.trim()">
              <el-icon><Position /></el-icon>
              对比
            </el-button>
          </el-tooltip>
          
          <el-tooltip content="交换文本" placement="top">
            <el-button @click="swapTexts" :disabled="!leftText.trim() && !rightText.trim()">
              <el-icon><Switch /></el-icon>
              交换
            </el-button>
          </el-tooltip>
          
          <el-tooltip content="清空所有" placement="top">
            <el-button @click="clearAll">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
          </el-tooltip>
        </div>
        
        <div class="toolbar-group">
          <el-tooltip content="导入左侧文件" placement="top">
            <el-upload
              class="upload-file"
              action=""
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(file) => handleFileChange(file, 'left')"
              accept=".txt,.md,.json,.xml,.html,.css,.js,.ts,.vue,.py,.java,.cpp,.c,.h"
            >
              <el-button>
                <el-icon><Upload /></el-icon>
                导入左侧
              </el-button>
            </el-upload>
          </el-tooltip>
          
          <el-tooltip content="导入右侧文件" placement="top">
            <el-upload
              class="upload-file"
              action=""
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(file) => handleFileChange(file, 'right')"
              accept=".txt,.md,.json,.xml,.html,.css,.js,.ts,.vue,.py,.java,.cpp,.c,.h"
            >
              <el-button>
                <el-icon><Upload /></el-icon>
                导入右侧
              </el-button>
            </el-upload>
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- 统计信息面板 -->
    <div v-if="diffResults.length > 0" class="stats-panel">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ diffSummary.totalLines }}</div>
          <div class="stat-label">总行数</div>
        </div>
        <div class="stat-item added">
          <div class="stat-value">{{ diffSummary.addedLines }}</div>
          <div class="stat-label">新增行</div>
        </div>
        <div class="stat-item deleted">
          <div class="stat-value">{{ diffSummary.deletedLines }}</div>
          <div class="stat-label">删除行</div>
        </div>
        <div class="stat-item modified">
          <div class="stat-value">{{ diffSummary.modifiedLines }}</div>
          <div class="stat-label">修改行</div>
        </div>
        <div class="stat-item unchanged">
          <div class="stat-value">{{ diffSummary.unchangedLines }}</div>
          <div class="stat-label">未变更</div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-section">
      <!-- 未对比状态：显示输入区域 -->
      <div v-if="!isCompared" class="input-containers">
        <div class="input-container">
          <div class="input-header">
            <h3>原始文本</h3>
            <div class="input-actions">
              <el-button size="small" @click="clearText('left')" :disabled="!leftText.trim()">
                <el-icon><Delete /></el-icon>
              </el-button>
              <el-button size="small" @click="copyText(leftText)" :disabled="!leftText.trim()">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
          </div>
          <el-input
            v-model="leftText"
            type="textarea"
            :rows="20"
            placeholder="请输入或粘贴原始文本..."
            resize="vertical"
            class="text-input"
          />
          <div class="input-stats">
            <span>行数: {{ getLineCount(leftText) }}</span>
            <span>字符: {{ leftText.length }}</span>
          </div>
        </div>

        <div class="input-container">
          <div class="input-header">
            <h3>对比文本</h3>
            <div class="input-actions">
              <el-button size="small" @click="clearText('right')" :disabled="!rightText.trim()">
                <el-icon><Delete /></el-icon>
              </el-button>
              <el-button size="small" @click="copyText(rightText)" :disabled="!rightText.trim()">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
          </div>
          <el-input
            v-model="rightText"
            type="textarea"
            :rows="20"
            placeholder="请输入或粘贴对比文本..."
            resize="vertical"
            class="text-input"
          />
          <div class="input-stats">
            <span>行数: {{ getLineCount(rightText) }}</span>
            <span>字符: {{ rightText.length }}</span>
          </div>
        </div>
      </div>

      <!-- 对比结果显示 -->
      <div v-else class="diff-containers">
        <div class="diff-header">
          <div class="diff-title">
            <h3>对比结果</h3>
            <el-button size="small" @click="backToEdit">
              <el-icon><Back /></el-icon>
              返回编辑
            </el-button>
          </div>
          <div class="diff-legend">
            <span class="legend-item added">
              <span class="legend-color"></span>
              新增内容
            </span>
            <span class="legend-item deleted">
              <span class="legend-color"></span>
              删除内容
            </span>
            <span class="legend-item unchanged">
              <span class="legend-color"></span>
              无变化
            </span>
          </div>
        </div>

        <div class="diff-result">
          <div class="diff-line-numbers">
            <div v-for="(diff, index) in diffResults" :key="index" class="line-number">
              {{ diff.lineNumber }}
            </div>
          </div>
          
          <div class="diff-content">
            <div 
              v-for="(diff, index) in diffResults" 
              :key="index" 
              :class="['diff-line', `diff-${diff.type}`]"
            >
              <div class="diff-indicator">
                <span v-if="diff.type === 'insert'" class="indicator-plus">+</span>
                <span v-else-if="diff.type === 'delete'" class="indicator-minus">-</span>
                <span v-else class="indicator-space">&nbsp;</span>
              </div>
              <div class="diff-text" v-html="formatDiffLine(diff)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Position, 
  Switch, 
  Delete, 
  Upload, 
  CopyDocument, 
  Back 
} from '@element-plus/icons-vue'
import { TextDiffUtils, type DiffResult, type DiffSummary } from '@/utils/TextDiffUtils'

// 响应式数据
const leftText = ref<string>('')
const rightText = ref<string>('')
const diffResults = ref<DiffResult[]>([])
const isCompared = ref<boolean>(false)

// 计算属性
const diffSummary = computed<DiffSummary>(() => {
  if (diffResults.value.length === 0) {
    return {
      totalLines: 0,
      addedLines: 0,
      deletedLines: 0,
      modifiedLines: 0,
      unchangedLines: 0
    }
  }
  return TextDiffUtils.getDiffSummary(diffResults.value)
})

// 方法
const compareTexts = () => {
  if (!leftText.value.trim() && !rightText.value.trim()) {
    ElMessage.warning('请至少输入一段文本进行对比')
    return
  }
  
  try {
    diffResults.value = TextDiffUtils.computeDiff(leftText.value, rightText.value)
    isCompared.value = true
    ElMessage.success('文本对比完成')
  } catch (error) {
    console.error('文本对比失败:', error)
    ElMessage.error('文本对比失败，请检查输入内容')
  }
}

const swapTexts = () => {
  const temp = leftText.value
  leftText.value = rightText.value
  rightText.value = temp
  ElMessage.success('文本已交换')
}

const clearAll = () => {
  leftText.value = ''
  rightText.value = ''
  diffResults.value = []
  isCompared.value = false
  ElMessage.success('已清空所有内容')
}

const clearText = (side: 'left' | 'right') => {
  if (side === 'left') {
    leftText.value = ''
  } else {
    rightText.value = ''
  }
  ElMessage.success('已清空')
}

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

const backToEdit = () => {
  isCompared.value = false
}

const getLineCount = (text: string): number => {
  return text ? text.split('\n').length : 0
}

const handleFileChange = (file: any, side: 'left' | 'right') => {
  const fileObj = file.raw
  if (!fileObj) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    if (side === 'left') {
      leftText.value = content
    } else {
      rightText.value = content
    }
    ElMessage.success('文件导入成功')
  }
  reader.onerror = () => {
    ElMessage.error('文件读取失败')
  }
  reader.readAsText(fileObj, 'UTF-8')
}

const formatDiffLine = (diff: DiffResult): string => {
  if (diff.type === 'equal') {
    return escapeHtml(diff.oldText || diff.newText)
  } else if (diff.type === 'insert') {
    return escapeHtml(diff.newText)
  } else if (diff.type === 'delete') {
    return escapeHtml(diff.oldText)
  }
  return ''
}

const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text || ''
  return div.innerHTML
}
</script>

<style scoped>
.text-comparison {
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

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toolbar-group {
  display: flex;
  gap: 12px;
}

.upload-file {
  display: inline-block;
}

.stats-panel {
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  border-radius: 6px;
  background: #f8f9fa;
}

.stat-item.added {
  background: #e8f5e8;
  color: #52c41a;
}

.stat-item.deleted {
  background: #fff2f0;
  color: #ff4d4f;
}

.stat-item.modified {
  background: #fff7e6;
  color: #fa8c16;
}

.stat-item.unchanged {
  background: #f6f6f6;
  color: #666;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.content-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.input-containers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--border-color);
}

.input-container {
  background: #fff;
  display: flex;
  flex-direction: column;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid var(--border-lighter);
}

.input-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.input-actions {
  display: flex;
  gap: 8px;
}

.text-input {
  flex: 1;
}

.text-input :deep(.el-textarea__inner) {
  border: none;
  border-radius: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: none;
}

.input-stats {
  padding: 8px 16px;
  background: #fafafa;
  border-top: 1px solid var(--border-lighter);
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  gap: 16px;
}

.diff-containers {
  padding: 16px;
}

.diff-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-lighter);
}

.diff-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.diff-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.diff-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-item.added .legend-color {
  background: #52c41a;
}

.legend-item.deleted .legend-color {
  background: #ff4d4f;
}

.legend-item.unchanged .legend-color {
  background: #d9d9d9;
}

.diff-result {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

.diff-line-numbers {
  background: #fafafa;
  border-right: 1px solid var(--border-color);
  padding: 0;
  min-width: 60px;
}

.line-number {
  padding: 4px 12px;
  text-align: right;
  color: var(--text-secondary);
  border-bottom: 1px solid transparent;
  user-select: none;
}

.diff-content {
  flex: 1;
  overflow-x: auto;
}

.diff-line {
  display: flex;
  border-bottom: 1px solid transparent;
  min-height: 22px;
  line-height: 1.5;
}

.diff-line.diff-insert {
  background: #f6ffed;
  border-bottom-color: #b7eb8f;
}

.diff-line.diff-delete {
  background: #fff2f0;
  border-bottom-color: #ffb3b0;
}

.diff-indicator {
  width: 20px;
  text-align: center;
  padding: 4px 0;
  font-weight: bold;
  user-select: none;
}

.indicator-plus {
  color: #52c41a;
}

.indicator-minus {
  color: #ff4d4f;
}

.diff-text {
  flex: 1;
  padding: 4px 12px 4px 4px;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 12px;
  }
  
  .toolbar-group {
    justify-content: center;
  }
  
  .input-containers {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .diff-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .diff-legend {
    flex-wrap: wrap;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .text-comparison {
    padding: 0 10px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .diff-result {
    font-size: 12px;
  }
}
</style> 