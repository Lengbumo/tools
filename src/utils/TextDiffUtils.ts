export interface DiffResult {
  type: 'equal' | 'insert' | 'delete' | 'replace'
  oldIndex: number
  newIndex: number
  oldText: string
  newText: string
  lineNumber: number
}

export interface DiffSummary {
  totalLines: number
  addedLines: number
  deletedLines: number
  modifiedLines: number
  unchangedLines: number
}

export class TextDiffUtils {
  /**
   * 计算两个文本之间的差异
   * @param oldText 原始文本
   * @param newText 新文本
   * @returns 差异结果数组
   */
  static computeDiff(oldText: string, newText: string): DiffResult[] {
    const oldLines = oldText.split('\n')
    const newLines = newText.split('\n')
    
    return this.computeLineDiff(oldLines, newLines)
  }

  /**
   * 基于行的文本差异算法（简化版LCS算法）
   */
  private static computeLineDiff(oldLines: string[], newLines: string[]): DiffResult[] {
    const oldLen = oldLines.length
    const newLen = newLines.length
    const diffs: DiffResult[] = []
    
    // 创建LCS动态规划表
    const dp: number[][] = Array(oldLen + 1).fill(null).map(() => Array(newLen + 1).fill(0))
    
    // 填充LCS表
    for (let i = 1; i <= oldLen; i++) {
      for (let j = 1; j <= newLen; j++) {
        if (oldLines[i - 1] === newLines[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        }
      }
    }
    
    // 回溯构建差异结果
    let i = oldLen, j = newLen, lineNumber = 1
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
        // 相同行
        diffs.unshift({
          type: 'equal',
          oldIndex: i - 1,
          newIndex: j - 1,
          oldText: oldLines[i - 1],
          newText: newLines[j - 1],
          lineNumber: lineNumber
        })
        i--
        j--
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        // 新增行
        diffs.unshift({
          type: 'insert',
          oldIndex: -1,
          newIndex: j - 1,
          oldText: '',
          newText: newLines[j - 1],
          lineNumber: lineNumber
        })
        j--
      } else if (i > 0) {
        // 删除行
        diffs.unshift({
          type: 'delete',
          oldIndex: i - 1,
          newIndex: -1,
          oldText: oldLines[i - 1],
          newText: '',
          lineNumber: lineNumber
        })
        i--
      }
      lineNumber++
    }
    
    // 重新编号行号
    this.renumberLines(diffs)
    
    return diffs
  }

  /**
   * 重新为差异结果编号
   */
  private static renumberLines(diffs: DiffResult[]) {
    let lineNumber = 1
    for (const diff of diffs) {
      diff.lineNumber = lineNumber++
    }
  }

  /**
   * 获取差异摘要信息
   */
  static getDiffSummary(diffs: DiffResult[]): DiffSummary {
    const summary: DiffSummary = {
      totalLines: diffs.length,
      addedLines: 0,
      deletedLines: 0,
      modifiedLines: 0,
      unchangedLines: 0
    }

    for (const diff of diffs) {
      switch (diff.type) {
        case 'insert':
          summary.addedLines++
          break
        case 'delete':
          summary.deletedLines++
          break
        case 'replace':
          summary.modifiedLines++
          break
        case 'equal':
          summary.unchangedLines++
          break
      }
    }

    return summary
  }

  /**
   * 计算字符级差异（用于单行对比）
   */
  static computeCharDiff(oldText: string, newText: string): Array<{
    type: 'equal' | 'insert' | 'delete'
    text: string
  }> {
    const diffs: Array<{ type: 'equal' | 'insert' | 'delete', text: string }> = []
    
    if (oldText === newText) {
      return [{ type: 'equal', text: oldText }]
    }

    // 简化的字符级差异算法
    let i = 0, j = 0
    const oldChars = oldText.split('')
    const newChars = newText.split('')

    while (i < oldChars.length || j < newChars.length) {
      if (i < oldChars.length && j < newChars.length && oldChars[i] === newChars[j]) {
        // 找到相同字符序列
        let equalText = ''
        while (i < oldChars.length && j < newChars.length && oldChars[i] === newChars[j]) {
          equalText += oldChars[i]
          i++
          j++
        }
        diffs.push({ type: 'equal', text: equalText })
      } else {
        // 处理不同的部分
        let deletedText = ''
        let insertedText = ''
        
        // 收集删除的字符
        while (i < oldChars.length && (j >= newChars.length || oldChars[i] !== newChars[j])) {
          deletedText += oldChars[i]
          i++
        }
        
        // 收集插入的字符
        while (j < newChars.length && (i >= oldChars.length || oldChars[i] !== newChars[j])) {
          insertedText += newChars[j]
          j++
        }
        
        if (deletedText) {
          diffs.push({ type: 'delete', text: deletedText })
        }
        if (insertedText) {
          diffs.push({ type: 'insert', text: insertedText })
        }
      }
    }

    return diffs
  }

  /**
   * 将差异结果转换为HTML格式（用于高亮显示）
   */
  static diffToHtml(diffs: Array<{ type: 'equal' | 'insert' | 'delete', text: string }>): string {
    let html = ''
    
    for (const diff of diffs) {
      const text = this.escapeHtml(diff.text)
      switch (diff.type) {
        case 'equal':
          html += text
          break
        case 'insert':
          html += `<span class="diff-insert">${text}</span>`
          break
        case 'delete':
          html += `<span class="diff-delete">${text}</span>`
          break
      }
    }
    
    return html
  }

  /**
   * 转义HTML字符
   */
  private static escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
} 