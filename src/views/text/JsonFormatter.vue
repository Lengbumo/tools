<template>
  <div class="json-formatter">
    <div class="json-container">
      <div class="input-container">
        <div class="panel-header">
          <div class="header-actions">
            <el-tooltip content="格式化" placement="top" :disabled="!jsonInput">
              <div>
                <el-button type="primary" link @click="formatJson" :disabled="!jsonInput">
                  <el-icon><Document /></el-icon>
                </el-button>
              </div>
            </el-tooltip>
            <el-tooltip content="压缩" placement="top" :disabled="!jsonInput">
              <div>
                <el-button type="primary" link @click="compressJson" :disabled="!jsonInput">
                  <el-icon><Compass /></el-icon>
                </el-button>
              </div>
            </el-tooltip>
            <el-tooltip content="清空" placement="top">
              <div>
                <el-button type="primary" link @click="clearJson">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </el-tooltip>
            <el-tooltip content="导入文件" placement="top">
              <div>
                <el-upload
                  class="upload-json"
                  action=""
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleFileChange"
                >
                  <el-button type="primary" link>
                    <el-icon><Upload /></el-icon>
                  </el-button>
                </el-upload>
              </div>
            </el-tooltip>
          </div>
        </div>
        <Codemirror
          v-model:value="jsonInput"
          :options="editorOptions"
          height="100%"
          @change="onInputChange"
          @ready="onCmReady"
        />
      </div>
      <div class="output-container">
        <div class="panel-header">
          <div class="header-actions">
            <el-tooltip content="全部展开" placement="top" :disabled="!formattedJson">
              <div>
                <el-button type="primary" link @click="expandAll" :disabled="!formattedJson">
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
              </div>
            </el-tooltip>
            <el-tooltip content="全部折叠" placement="top" :disabled="!formattedJson">
              <div>
                <el-button type="primary" link @click="collapseAll" :disabled="!formattedJson">
                  <el-icon><ArrowUp /></el-icon>
                </el-button>
              </div>
            </el-tooltip>
            <el-tooltip content="复制" placement="top" :disabled="!formattedJson">
              <div>
                <el-button type="primary" link @click="copyJson" :disabled="!formattedJson">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
            </el-tooltip>
            <el-tooltip content="保存" placement="top" :disabled="!formattedJson">
              <div>
                <el-button type="primary" link @click="saveJson" :disabled="!formattedJson">
                  <el-icon><Download /></el-icon>
                </el-button>
              </div>
            </el-tooltip>
          </div>
        </div>
        <div v-if="errorMessage" class="error-container">
          <div class="error-message">{{ errorMessage }}</div>
          <pre v-if="errorSnippet" class="error-snippet">{{ errorSnippet }}</pre>
        </div>
        <div v-else class="formatted-editor-container">
          <Codemirror
            v-model:value="formattedJson"
            :options="formattedEditorOptions"
            height="100%"
            @change="onFormattedChange"
            @ready="onFormattedCmReady"
          />
        </div>
      </div>
    </div>
    <div v-if="autoApplyStatus" class="auto-apply-status" :class="{ 'success': autoApplyStatus.success }">
      {{ autoApplyStatus.message }}
    </div>
  </div>
</template>

<script lang="ts">
import { ref, reactive, onMounted, nextTick, defineComponent, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Compass, Delete, ArrowDown, ArrowUp, CopyDocument, Download, Moon, Sunny, Upload } from '@element-plus/icons-vue'
import Codemirror from 'codemirror-editor-vue3'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/lint/lint.js'
import 'codemirror/addon/lint/json-lint.js'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/foldgutter.css'
import JsonUtils from '@/utils/JsonUtils'

// 为 CodeMirror 提供安全的 jsonlint 访问
declare global {
  interface Window {
    jsonlint?: any;
  }
}

// 安全初始化 jsonlint 用于 CodeMirror
const initJsonlint = async () => {
  try {
    if (typeof window !== 'undefined') {
      // 尝试动态导入 jsonlint
      const jsonlintModule = await import('jsonlint');
      const jsonlint = jsonlintModule.default || jsonlintModule;
      window.jsonlint = jsonlint;
    }
  } catch (error) {
    console.warn('jsonlint 模块加载失败，CodeMirror 将使用基础语法检查:', error);
    // 提供一个最小的替代实现
    if (typeof window !== 'undefined') {
      window.jsonlint = {
        parse: (text: string) => {
          try {
            return JSON.parse(text);
          } catch (e) {
            throw e;
          }
        }
      };
    }
  }
};

// 初始化 jsonlint
initJsonlint();

// 编辑器选项接口
interface EditorOptions {
  mode: string;
  lineNumbers: boolean;
  lineWrapping: boolean;
  foldGutter: boolean;
  gutters: string[];
  theme: string;
  lint: any;
  readOnly?: boolean;
  tabSize?: number;
  indentUnit?: number;
  indentWithTabs?: boolean;
  autoCloseBrackets?: boolean;
}

// 自动应用状态接口
interface AutoApplyStatus {
  message: string;
  success: boolean;
  timer?: number;
}

export default defineComponent({
  name: 'JsonFormatter',
  components: {
    Codemirror,
    Document,
    Compass,
    Delete,
    ArrowDown,
    ArrowUp,
    CopyDocument,
    Download,
    Moon,
    Sunny,
    Upload
  },
  setup() {
    const jsonInput = ref<string>('')
    const formattedJson = ref<string>('')
    const parsedJson = ref<any>(null)
    const errorMessage = ref<string>('')
    const errorSnippet = ref<string>('')
    const isDarkTheme = ref<boolean>(false)
    const cmInstance = ref<any>(null)
    const formattedCmInstance = ref<any>(null)
    const autoApplyStatus = ref<AutoApplyStatus | null>(null)
    const isUpdatingFromInput = ref<boolean>(false)
    
    // 输入编辑器选项
    const editorOptions = reactive<EditorOptions>({
      mode: 'application/json',
      lineNumbers: true,
      lineWrapping: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
      theme: 'default',
      lint: {
        // 自定义 lint 选项，当输入为空时不显示错误
        getAnnotations: (content: string, options: any, editor: any) => {
          if (!content || !content.trim()) {
            return [];
          }
          // 使用默认的 JSON lint
          return (window as any).CodeMirror.lint.json(content, options, editor);
        }
      }
    })
    
    // 格式化后的编辑器选项
    const formattedEditorOptions = reactive<EditorOptions>({
      mode: 'application/json',
      lineNumbers: true,
      lineWrapping: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
      theme: 'default',
      lint: {
        // 自定义 lint 选项，当输入为空时不显示错误
        getAnnotations: (content: string, options: any, editor: any) => {
          if (!content || !content.trim()) {
            return [];
          }
          // 使用默认的 JSON lint
          return (window as any).CodeMirror.lint.json(content, options, editor);
        }
      },
      tabSize: 2,
      indentUnit: 2,
      indentWithTabs: false
    })

    // 显示自动应用状态
    const showAutoApplyStatus = (message: string, success: boolean): void => {
      // 清除之前的定时器
      if (autoApplyStatus.value && autoApplyStatus.value.timer) {
        clearTimeout(autoApplyStatus.value.timer);
      }
      
      // 设置新状态
      autoApplyStatus.value = {
        message,
        success,
        timer: window.setTimeout(() => {
          autoApplyStatus.value = null;
        }, 3000) // 3秒后自动消失
      };
    }

    // 格式化 JSON
    const formatJson = (): void => {
      if (!jsonInput.value || !jsonInput.value.trim()) {
        // 如果输入为空，不显示错误
        clearJson();
        return;
      }
      
      const result = JsonUtils.format(jsonInput.value)
      
      if (result.success) {
        isUpdatingFromInput.value = true;
        formattedJson.value = result.formattedJson
        jsonInput.value = result.formattedJson
        errorMessage.value = ''
        errorSnippet.value = ''
        
        // 清除错误标记
        clearErrorMarkers();
        
        // 设置解析后的 JSON 对象
        if (result.parsedJson) {
          parsedJson.value = result.parsedJson
        }
        
        // 重置标志
        nextTick(() => {
          isUpdatingFromInput.value = false;
        });
      } else {
        errorMessage.value = result.error || '未知错误'
        
        // 如果有错误位置信息，显示错误片段
        if (result.errorPosition) {
          errorSnippet.value = result.errorPosition.snippet
          
          // 如果有 CodeMirror 实例，标记错误位置
          if (cmInstance.value) {
            markError(cmInstance.value, result.errorPosition.line, result.errorPosition.column);
          }
        }
      }
    }

    // 压缩 JSON
    const compressJson = (): void => {
      if (!jsonInput.value || !jsonInput.value.trim()) {
        // 如果输入为空，不显示错误
        clearJson();
        return;
      }
      
      const result = JsonUtils.compress(jsonInput.value)
      
      if (result.success) {
        isUpdatingFromInput.value = true;
        formattedJson.value = result.compressedJson
        jsonInput.value = result.compressedJson
        errorMessage.value = ''
        errorSnippet.value = ''
        
        // 清除错误标记
        clearErrorMarkers();
        
        // 设置解析后的 JSON 对象
        if (result.parsedJson) {
          parsedJson.value = result.parsedJson
        }
        
        // 重置标志
        nextTick(() => {
          isUpdatingFromInput.value = false;
        });
      } else {
        errorMessage.value = result.error || '未知错误'
        
        // 如果有错误位置信息，显示错误片段
        if (result.errorPosition) {
          errorSnippet.value = result.errorPosition.snippet
          
          // 如果有 CodeMirror 实例，标记错误位置
          if (cmInstance.value) {
            markError(cmInstance.value, result.errorPosition.line, result.errorPosition.column);
          }
        }
      }
    }

    // 清空 JSON
    const clearJson = (): void => {
      jsonInput.value = ''
      formattedJson.value = ''
      parsedJson.value = null
      errorMessage.value = ''
      errorSnippet.value = ''
      
      // 清除错误标记
      clearErrorMarkers();
    }

    // 复制 JSON
    const copyJson = (): void => {
      navigator.clipboard.writeText(formattedJson.value)
        .then(() => {
          ElMessage.success('已复制到剪贴板')
        })
        .catch(() => {
          ElMessage.error('复制失败')
        })
    }

    // 保存 JSON
    const saveJson = (): void => {
      JsonUtils.saveToFile(formattedJson.value)
    }

    // 切换主题
    const toggleTheme = (): void => {
      isDarkTheme.value = !isDarkTheme.value
      const theme = isDarkTheme.value ? 'darcula' : 'default'
      editorOptions.theme = theme
      formattedEditorOptions.theme = theme
      
      // 如果已经有实例，直接设置主题
      if (cmInstance.value) {
        cmInstance.value.setOption('theme', theme)
      }
      
      if (formattedCmInstance.value) {
        formattedCmInstance.value.setOption('theme', theme)
      }
    }

    // 清除错误标记
    const clearErrorMarkers = (): void => {
      if (cmInstance.value) {
        clearEditorMarkers(cmInstance.value);
      }
      
      if (formattedCmInstance.value) {
        clearEditorMarkers(formattedCmInstance.value);
      }
    }
    
    // 清除编辑器错误标记
    const clearEditorMarkers = (editor: any): void => {
      // 清除所有标记
      editor.clearGutter('CodeMirror-lint-markers');
      
      // 清除所有行高亮
      const lineCount = editor.lineCount();
      for (let i = 0; i < lineCount; i++) {
        editor.removeLineClass(i, 'background', 'CodeMirror-lint-line-error');
      }
    }

    // 输入变化时处理
    const onInputChange = (value: string): void => {
      if (!value || !value.trim()) {
        parsedJson.value = null
        formattedJson.value = ''
        errorMessage.value = ''
        errorSnippet.value = ''
        
        // 清除错误标记
        clearErrorMarkers();
        
        return
      }

      const validateResult = JsonUtils.validate(value)
      
      if (validateResult.valid) {
        errorMessage.value = ''
        errorSnippet.value = ''
        
        try {
          // 格式化 JSON 并设置到右侧编辑器
          isUpdatingFromInput.value = true;
          const formatted = JSON.stringify(JSON.parse(value), null, 2)
          formattedJson.value = formatted
          parsedJson.value = JSON.parse(value)
          
          // 清除错误标记
          clearErrorMarkers();
          
          // 重置标志
          nextTick(() => {
            isUpdatingFromInput.value = false;
          });
        } catch (e) {
          console.error('JSON 解析错误:', e)
          parsedJson.value = null
          formattedJson.value = ''
        }
      } else {
        errorMessage.value = validateResult.error || '未知错误'
        
        // 如果有错误位置信息，显示错误片段
        if (validateResult.errorPosition) {
          errorSnippet.value = validateResult.errorPosition.snippet
          
          // 如果有 CodeMirror 实例，标记错误位置
          if (cmInstance.value) {
            markError(cmInstance.value, validateResult.errorPosition.line, validateResult.errorPosition.column);
          }
        }
        
        parsedJson.value = null
        formattedJson.value = ''
      }
    }
    
    // 格式化后的编辑器内容变化时处理
    const onFormattedChange = (value: string): void => {
      // 如果是从输入编辑器更新的，不需要再处理
      if (isUpdatingFromInput.value) {
        return;
      }
      
      if (!value || !value.trim()) {
        return;
      }
      
      try {
        // 验证右侧编辑器的 JSON 是否有效
        const parsed = JSON.parse(value);
        
        // 更新左侧编辑器的值
        jsonInput.value = value;
        parsedJson.value = parsed;
        
        // 清除错误标记
        clearErrorMarkers();
        
        // 显示成功状态
        showAutoApplyStatus('更改已自动应用', true);
      } catch (e) {
        // 如果解析失败，显示错误
        showAutoApplyStatus('JSON 格式无效，请修正后再继续编辑', false);
        
        // 尝试标记错误位置
        if (formattedCmInstance.value) {
          const error = e as Error;
          const match = error.message.match(/position\s+(\d+)/);
          if (match && match[1]) {
            const position = parseInt(match[1]);
            const { line, ch } = formattedCmInstance.value.posFromIndex(position);
            markError(formattedCmInstance.value, line + 1, ch + 1);
          }
        }
      }
    }

    // 标记错误位置
    const markError = (editor: any, line: number, column: number): void => {
      if (!editor) return;
      
      // 清除所有标记
      editor.clearGutter('CodeMirror-lint-markers');
      
      // 创建错误标记
      const marker = document.createElement('div');
      marker.className = 'CodeMirror-lint-marker CodeMirror-lint-marker-error';
      marker.title = `错误位置: 第 ${line} 行, 第 ${column} 列`;
      
      // 添加标记到指定行
      editor.setGutterMarker(line - 1, 'CodeMirror-lint-markers', marker);
      
      // 高亮错误行
      editor.addLineClass(line - 1, 'background', 'CodeMirror-lint-line-error');
      
      // 将光标移动到错误位置
      editor.setCursor(line - 1, column - 1);
      editor.focus();
    }

    // 处理 CodeMirror 实例准备就绪
    const onCmReady = (cm: any): void => {
      cmInstance.value = cm;
      
      // 在编辑器初始化时立即清除错误标记
      clearEditorMarkers(cm);
    }
    
    // 处理格式化后的 CodeMirror 实例准备就绪
    const onFormattedCmReady = (cm: any): void => {
      formattedCmInstance.value = cm;
      
      // 在编辑器初始化时立即清除错误标记
      clearEditorMarkers(cm);
    }

    // 处理文件上传
    const handleFileChange = (file: any): void => {
      JsonUtils.readFromFile(file.raw)
        .then((result) => {
          if (result.content) {
            jsonInput.value = result.content
            onInputChange(result.content)
          }
        })
        .catch((error) => {
          errorMessage.value = error.error || '文件读取失败'
        })
    }
    
    // 全部展开
    const expandAll = (): void => {
      if (!formattedCmInstance.value) return;
      
      // 获取所有折叠标记
      const marks = formattedCmInstance.value.getAllMarks();
      
      // 展开所有折叠
      marks.forEach((mark: any) => {
        if (mark.collapsed) {
          mark.clear();
        }
      });
    }

    // 全部折叠
    const collapseAll = (): void => {
      if (!formattedCmInstance.value) return;
      
      try {
        // 重新加载编辑器内容，触发自动折叠
        const content = formattedJson.value;
        formattedJson.value = '';
        nextTick(() => {
          formattedJson.value = content;
          
          // 等待编辑器渲染完成后折叠所有可折叠区域
          nextTick(() => {
            if (formattedCmInstance.value) {
              const lineCount = formattedCmInstance.value.lineCount();
              for (let i = 0; i < lineCount; i++) {
                const line = formattedCmInstance.value.getLine(i);
                if (line && (line.includes('{') || line.includes('['))) {
                  formattedCmInstance.value.foldCode({line: i, ch: line.length}, null, 'fold');
                }
              }
            }
          });
        });
      } catch (e) {
        console.error('折叠失败:', e);
      }
    }

    onMounted(() => {
      // 初始化时确保不显示错误标记
      errorMessage.value = '';
      errorSnippet.value = '';
    })

    return {
      jsonInput,
      formattedJson,
      parsedJson,
      errorMessage,
      errorSnippet,
      isDarkTheme,
      autoApplyStatus,
      editorOptions,
      formattedEditorOptions,
      formatJson,
      compressJson,
      clearJson,
      expandAll,
      collapseAll,
      copyJson,
      saveJson,
      toggleTheme,
      onInputChange,
      onFormattedChange,
      handleFileChange,
      onCmReady,
      onFormattedCmReady
    }
  }
})
</script>

<style scoped>
.json-formatter {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
}

.json-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.input-container, .output-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  margin: 10px;
  border-radius: 4px;
  overflow: hidden;
}

.panel-header {
  padding: 8px 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.header-actions .el-button {
  font-size: 16px;
  height: 28px;
  width: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-actions .el-icon {
  margin-right: 0;
}

.upload-json {
  display: inline-block;
}

.error-container {
  flex: 1;
  overflow: auto;
  padding: 15px;
  background-color: #fff8f8;
  border-radius: 4px;
}

.error-message {
  color: #f56c6c;
  font-size: 14px;
  margin-bottom: 10px;
}

.error-snippet {
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
  font-family: monospace;
  white-space: pre-wrap;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.5;
}

.formatted-editor-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.auto-apply-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 15px;
  background-color: #f56c6c;
  color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 9999;
  transition: all 0.3s;
  font-size: 14px;
}

.auto-apply-status.success {
  background-color: #67c23a;
}

/* CodeMirror 错误标记样式 */
:deep(.CodeMirror-lint-marker-error) {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16'%3E%3Cpath fill='%23f56c6c' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E");
  background-size: contain;
  margin-left: 5px;
}

:deep(.CodeMirror-lint-line-error) {
  background-color: rgba(255, 0, 0, 0.05);
}

:deep(.CodeMirror) {
  height: 100%;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .json-container {
    flex-direction: column;
  }
}
</style>
