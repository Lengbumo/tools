/**
 * JSON 工具类
 * 提供 JSON 相关的操作方法
 */

// 格式化 JSON 返回结果接口
interface FormatResult {
  success: boolean;
  error?: string;
  formattedJson: string;
  parsedJson?: any;
  errorPosition?: {
    line: number;
    column: number;
    snippet: string;
  };
}

// 压缩 JSON 返回结果接口
interface CompressResult {
  success: boolean;
  error?: string;
  compressedJson: string;
  parsedJson?: any;
  errorPosition?: {
    line: number;
    column: number;
    snippet: string;
  };
}

// 验证 JSON 返回结果接口
interface ValidateResult {
  valid: boolean;
  error?: string;
  errorPosition?: {
    line: number;
    column: number;
    snippet: string;
  };
}

// 读取文件返回结果接口
interface ReadFileResult {
  success: boolean;
  error?: string;
  content?: string;
  parsedJson?: any;
}

class JsonUtils {
  /**
   * 创建错误片段，只显示错误位置附近的内容
   * @param errorLine - 错误所在行
   * @param column - 错误列位置
   * @returns - 包含错误片段和指针位置的对象
   */
  private static createErrorSnippet(errorLine: string, column: number): string {
    // 检查是否有大量空白
    const trimmedLine = errorLine.trim();
    const leadingSpaces = errorLine.indexOf(trimmedLine);
    
    // 如果是空行或只有空白字符的行
    if (!trimmedLine) {
      return errorLine + '\n' + ' '.repeat(column - 1) + '^';
    }
    
    // 特殊处理行尾错误
    if (column >= errorLine.length) {
      // 如果错误在行尾或超出行尾
      const lastPart = errorLine.substring(Math.max(0, errorLine.length - 40));
      return '...' + lastPart + '\n' + ' '.repeat(lastPart.length + 3) + '^';
    }
    
    // 特殊处理行首错误
    if (column <= 3) {
      // 如果错误在行首
      const firstPart = errorLine.substring(0, Math.min(errorLine.length, 40));
      return firstPart + '...\n' + ' '.repeat(column - 1) + '^';
    }
    
    // 创建错误片段，只显示错误位置附近的内容
    const contextSize = 50; // 错误位置前后显示的字符数
    
    // 调整列位置，如果有大量前导空白，则从实际内容开始计算
    let adjustedColumn = column;
    let adjustedStart = 0;
    
    if (leadingSpaces > 10 && column > leadingSpaces) {
      // 如果前导空白超过10个字符，且错误位置在实际内容中
      adjustedColumn = column - leadingSpaces;
      adjustedStart = leadingSpaces;
    }
    
    const start = Math.max(adjustedStart, column - 1 - contextSize);
    const end = Math.min(errorLine.length, column - 1 + contextSize);
    
    let snippet = '';
    if (start > adjustedStart) {
      snippet += '...';
    }
    
    // 提取错误位置附近的内容
    const relevantContent = errorLine.substring(start, end);
    snippet += relevantContent;
    
    if (end < errorLine.length) {
      snippet += '...';
    }
    
    snippet += '\n';
    
    // 计算指针位置，考虑到可能的省略号
    let pointerPosition = column - start - 1;
    if (start > adjustedStart) {
      pointerPosition += 3; // 如果有省略号，加3
    }
    
    // 确保指针位置不为负
    const safePointerPosition = Math.max(0, pointerPosition);
    snippet += ' '.repeat(safePointerPosition) + '^';
    
    return snippet;
  }

  /**
   * 解析 JSON 错误信息，提取出行号、列号和错误片段
   * @param jsonString - 原始 JSON 字符串
   * @param errorMessage - 错误信息
   * @returns - 包含错误位置信息的对象
   */
  static parseErrorMessage(jsonString: string, errorMessage: string): { line: number; column: number; snippet: string } | undefined {
    try {
      // 尝试从错误信息中提取行号和列号
      const positionMatch = errorMessage.match(/position\s+(\d+)/i) || errorMessage.match(/at\s+line\s+(\d+)\s+column\s+(\d+)/i);
      
      if (positionMatch) {
        let line = 1;
        let column = 0;
        
        if (positionMatch.length === 2) {
          // 如果只匹配到位置，计算行号和列号
          const position = parseInt(positionMatch[1], 10);
          const lines = jsonString.substring(0, position).split('\n');
          line = lines.length;
          column = lines[lines.length - 1].length + 1;
        } else if (positionMatch.length === 3) {
          // 如果直接匹配到行号和列号
          line = parseInt(positionMatch[1], 10);
          column = parseInt(positionMatch[2], 10);
        }
        
        // 获取错误行的上下文
        const allLines = jsonString.split('\n');
        const errorLine = allLines[line - 1] || '';
        
        // 创建错误片段
        const snippet = this.createErrorSnippet(errorLine, column);
        
        return {
          line,
          column,
          snippet
        };
      }
      
      // 尝试从 jsonlint 错误中提取信息
      const jsonlintMatch = errorMessage.match(/line\s+(\d+).*column\s+(\d+)/i);
      if (jsonlintMatch) {
        const line = parseInt(jsonlintMatch[1], 10);
        const column = parseInt(jsonlintMatch[2], 10);
        
        // 获取错误行的上下文
        const allLines = jsonString.split('\n');
        const errorLine = allLines[line - 1] || '';
        
        // 创建错误片段
        const snippet = this.createErrorSnippet(errorLine, column);
        
        return {
          line,
          column,
          snippet
        };
      }
      
      return undefined;
    } catch (e) {
      return undefined;
    }
  }

  /**
   * 格式化错误信息，使其更易读
   * @param jsonString - 原始 JSON 字符串
   * @param error - 错误对象
   * @returns - 格式化后的错误信息
   */
  static formatErrorMessage(jsonString: string, error: any): { message: string; position?: { line: number; column: number; snippet: string } } {
    const errorMessage = error.message || String(error);
    const position = this.parseErrorMessage(jsonString, errorMessage);
    
    let message = errorMessage;
    
    // 美化错误信息
    if (position) {
      message = `在第 ${position.line} 行第 ${position.column} 列发生解析错误`;
      
      // 添加可能的错误原因
      if (errorMessage.includes('Expected')) {
        const expectedMatch = errorMessage.match(/Expected\s+([^,]+)/i);
        const gotMatch = errorMessage.match(/got\s+([^,]+)/i);
        
        if (expectedMatch && gotMatch) {
          message += `\n此处缺少 ${expectedMatch[1]} 字符, 实际上却是 ${gotMatch[1]}`;
        }
      } else if (errorMessage.includes('Unexpected')) {
        const unexpectedMatch = errorMessage.match(/Unexpected\s+([^,]+)/i);
        
        if (unexpectedMatch) {
          message += `\n此处出现了意外的 ${unexpectedMatch[1]} 字符`;
        }
      } else if (errorMessage.includes('end of input')) {
        message += '\n输入不完整，可能缺少结束括号或引号';
      } else if (errorMessage.includes('token')) {
        message += '\n存在无效的 JSON 标记';
      }
    }
    
    return { message, position };
  }

  /**
   * 格式化 JSON 字符串
   * @param jsonString - 要格式化的 JSON 字符串
   * @param indent - 缩进空格数，默认为 2
   * @returns - 包含格式化后的 JSON 字符串和可能的错误信息
   */
  static format(jsonString: string, indent: number = 2): FormatResult {
    try {
      if (!jsonString || jsonString.trim() === '') {
        return { 
          success: true, 
          formattedJson: ''
        };
      }
      
      // 解析 JSON 字符串
      const parsedJson = JSON.parse(jsonString);
      
      // 格式化 JSON
      const formattedJson = JSON.stringify(parsedJson, null, indent);
      
      return {
        success: true,
        formattedJson,
        parsedJson
      };
    } catch (error: any) {
      const { message, position } = this.formatErrorMessage(jsonString, error);
      
      return {
        success: false,
        error: message,
        formattedJson: '',
        errorPosition: position
      };
    }
  }
  
  /**
   * 压缩 JSON 字符串（移除所有空格）
   * @param jsonString - 要压缩的 JSON 字符串
   * @returns - 包含压缩后的 JSON 字符串和可能的错误信息
   */
  static compress(jsonString: string): CompressResult {
    try {
      if (!jsonString || jsonString.trim() === '') {
        return { 
          success: true, 
          compressedJson: ''
        };
      }
      
      // 解析 JSON 字符串
      const parsedJson = JSON.parse(jsonString);
      
      // 压缩 JSON（不包含空格）
      const compressedJson = JSON.stringify(parsedJson);
      
      return {
        success: true,
        compressedJson,
        parsedJson
      };
    } catch (error: any) {
      const { message, position } = this.formatErrorMessage(jsonString, error);
      
      return {
        success: false,
        error: message,
        compressedJson: '',
        errorPosition: position
      };
    }
  }
  
  /**
   * 验证 JSON 字符串是否有效
   * @param jsonString - 要验证的 JSON 字符串
   * @returns - 包含验证结果和可能的错误信息
   */
  static validate(jsonString: string): ValidateResult {
    try {
      if (!jsonString || jsonString.trim() === '') {
        // 空字符串视为有效，但不进行处理
        return { 
          valid: true
        };
      }
      
      // 尝试解析 JSON 字符串
      JSON.parse(jsonString);
      
      return {
        valid: true
      };
    } catch (error: any) {
      const { message, position } = this.formatErrorMessage(jsonString, error);
      
      return {
        valid: false,
        error: message,
        errorPosition: position
      };
    }
  }
  
  /**
   * 获取 JSON 对象的类型
   * @param value - 要检查的值
   * @returns - 值的类型
   */
  static getType(value: any): string {
    if (value === null) {
      return 'null';
    }
    
    if (Array.isArray(value)) {
      return 'array';
    }
    
    return typeof value;
  }
  
  /**
   * 将 URL 转换为可点击的链接
   * @param text - 可能包含 URL 的文本
   * @returns - 包含 HTML 链接的文本
   */
  static linkify(text: any): string {
    if (typeof text !== 'string') {
      return String(text);
    }
    
    // URL 正则表达式
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // 替换 URL 为 HTML 链接
    return text.replace(urlRegex, (url: string) => `<a href="${url}" target="_blank">${url}</a>`);
  }
  
  /**
   * 保存 JSON 到文件
   * @param jsonString - 要保存的 JSON 字符串
   * @param filename - 文件名，默认为 'data.json'
   */
  static saveToFile(jsonString: string, filename: string = 'data.json'): void {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  /**
   * 从文件读取 JSON
   * @param file - 要读取的文件
   * @returns - 包含读取结果的 Promise
   */
  static readFromFile(file: File): Promise<ReadFileResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const content = event.target?.result as string;
          const parsedJson = JSON.parse(content);
          
          resolve({
            success: true,
            content,
            parsedJson
          });
        } catch (error: any) {
          reject({
            success: false,
            error: `文件内容不是有效的 JSON: ${error.message}`
          });
        }
      };
      
      reader.onerror = () => {
        reject({
          success: false,
          error: '读取文件时发生错误'
        });
      };
      
      reader.readAsText(file);
    });
  }
  
  /**
   * 获取 JSON 对象的路径
   * @param json - JSON 对象
   * @param target - 目标值
   * @param path - 当前路径，默认为空
   * @param paths - 找到的路径数组，默认为空数组
   * @returns - 包含所有匹配路径的数组
   */
  static getJsonPaths(json: any, target: any, path: string = '', paths: string[] = []): string[] {
    // 如果当前值等于目标值，添加当前路径到结果数组
    if (json === target) {
      paths.push(path);
      return paths;
    }
    
    // 如果当前值是对象或数组，递归搜索
    if (json !== null && typeof json === 'object') {
      for (const key in json) {
        if (Object.prototype.hasOwnProperty.call(json, key)) {
          // 构建新路径
          const newPath = path ? `${path}.${key}` : key;
          
          // 递归搜索
          this.getJsonPaths(json[key], target, newPath, paths);
        }
      }
    }
    
    return paths;
  }
  
  /**
   * 根据路径获取 JSON 对象中的值
   * @param json - JSON 对象
   * @param path - 路径，例如 'user.address.city'
   * @returns - 路径对应的值，如果路径无效则返回 undefined
   */
  static getValueByPath(json: any, path: string): any {
    if (!path) {
      return json;
    }
    
    const keys = path.split('.');
    let result = json;
    
    for (const key of keys) {
      if (result === null || typeof result !== 'object') {
        return undefined;
      }
      
      result = result[key];
    }
    
    return result;
  }
}

export default JsonUtils; 