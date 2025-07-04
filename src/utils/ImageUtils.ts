export interface CompressOptions {
  quality?: number // 压缩质量 0-1
  maxWidth?: number // 最大宽度
  maxHeight?: number // 最大高度
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp'
  maintainAspectRatio?: boolean // 保持宽高比
}

export interface ImageInfo {
  file: File
  width: number
  height: number
  size: number
  type: string
  dataUrl: string
}

export interface CompressResult {
  originalImage: ImageInfo
  compressedImage: ImageInfo
  compressionRatio: number
  sizeDifference: number
}

export class ImageUtils {
  /**
   * 获取图片信息
   */
  static async getImageInfo(file: File): Promise<ImageInfo> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      const img = new Image()
      
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        img.onload = () => {
          resolve({
            file,
            width: img.width,
            height: img.height,
            size: file.size,
            type: file.type,
            dataUrl
          })
        }
        img.onerror = reject
        img.src = dataUrl
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * 压缩图片
   */
  static async compressImage(file: File, options: CompressOptions = {}): Promise<CompressResult> {
    const {
      quality = 0.8,
      maxWidth,
      maxHeight,
      outputFormat = 'image/jpeg',
      maintainAspectRatio = true
    } = options

    // 获取原始图片信息
    const originalImage = await this.getImageInfo(file)
    
    // 创建canvas进行压缩
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    return new Promise((resolve, reject) => {
      img.onload = () => {
        // 计算新的尺寸
        const dimensions = this.calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight,
          maintainAspectRatio
        )

        canvas.width = dimensions.width
        canvas.height = dimensions.height

        // 绘制并压缩图片
        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height)

        // 转换为blob
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error('图片压缩失败'))
              return
            }

            // 创建压缩后的文件
            const compressedFile = new File(
              [blob],
              this.generateFileName(file.name, outputFormat),
              { type: outputFormat }
            )

            // 获取压缩后的图片信息
            const compressedImage = await this.getImageInfo(compressedFile)

            // 计算压缩比例
            const compressionRatio = originalImage.size > 0 
              ? compressedImage.size / originalImage.size 
              : 0
            const sizeDifference = originalImage.size - compressedImage.size

            resolve({
              originalImage,
              compressedImage,
              compressionRatio: isNaN(compressionRatio) ? 0 : compressionRatio,
              sizeDifference: isNaN(sizeDifference) ? 0 : sizeDifference
            })
          },
          outputFormat,
          quality
        )
      }

      img.onerror = reject
      img.src = originalImage.dataUrl
    })
  }

  /**
   * 计算新的图片尺寸
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth?: number,
    maxHeight?: number,
    maintainAspectRatio: boolean = true
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight }

    if (!maxWidth && !maxHeight) {
      return { width, height }
    }

    if (maintainAspectRatio) {
      const aspectRatio = originalWidth / originalHeight

      if (maxWidth && maxHeight) {
        if (width > maxWidth || height > maxHeight) {
          if (maxWidth / maxHeight > aspectRatio) {
            width = maxHeight * aspectRatio
            height = maxHeight
          } else {
            width = maxWidth
            height = maxWidth / aspectRatio
          }
        }
      } else if (maxWidth && width > maxWidth) {
        width = maxWidth
        height = maxWidth / aspectRatio
      } else if (maxHeight && height > maxHeight) {
        height = maxHeight
        width = maxHeight * aspectRatio
      }
    } else {
      if (maxWidth) width = Math.min(width, maxWidth)
      if (maxHeight) height = Math.min(height, maxHeight)
    }

    return { width: Math.round(width), height: Math.round(height) }
  }

  /**
   * 生成新的文件名
   */
  private static generateFileName(originalName: string, outputFormat: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
    const extension = outputFormat.split('/')[1]
    return `${nameWithoutExt}_compressed.${extension}`
  }

  /**
   * 下载文件
   */
  static downloadFile(file: File, filename?: string) {
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (isNaN(bytes) || bytes < 0) return '0 B'
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 验证图片文件
   */
  static validateImageFile(file: File): { valid: boolean; message?: string } {
    // 检查文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        message: '不支持的图片格式，请选择 JPG、PNG、GIF 或 WebP 格式的图片'
      }
    }

    // 检查文件大小 (限制为50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        valid: false,
        message: '图片大小不能超过 50MB'
      }
    }

    return { valid: true }
  }

  /**
   * 批量压缩图片
   */
  static async compressBatch(
    files: File[],
    options: CompressOptions = {},
    onProgress?: (completed: number, total: number) => void
  ): Promise<CompressResult[]> {
    const results: CompressResult[] = []
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.compressImage(files[i], options)
        results.push(result)
        onProgress?.(i + 1, files.length)
      } catch (error) {
        console.error(`压缩第 ${i + 1} 张图片失败:`, error)
        // 继续处理下一张图片
      }
    }
    
    return results
  }

  /**
   * 创建图片预览
   */
  static createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
} 