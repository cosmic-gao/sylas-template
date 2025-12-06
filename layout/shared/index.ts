/**
 * Layout 共享工具函数
 */

/**
 * 布局名称规范化
 * 将布局文件名转换为布局名称
 * @param fileName - 布局文件名（如 `default.tsx`、`admin.tsx`）
 * @returns 布局名称（如 `default`、`admin`）
 */
export const normalizeLayoutName = (fileName: string): string => {
  // 去除文件扩展名
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, '')
  // 如果文件名是 index，返回 default
  if (nameWithoutExt.toLowerCase() === 'index') {
    return 'default'
  }
  return nameWithoutExt
}

/**
 * 检查是否为默认布局
 * @param layoutName - 布局名称
 * @returns 是否为默认布局
 */
export const isDefaultLayout = (layoutName: string): boolean => {
  return layoutName === 'default' || layoutName === ''
}

