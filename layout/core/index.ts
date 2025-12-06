/**
 * Layout 核心逻辑
 */

export type LayoutLoader = () => Promise<{ default: any }>
export type LayoutGlobs = Record<string, LayoutLoader>

export interface LayoutMeta {
  name: string
  file: string
  loader: LayoutLoader
}

export interface PageLayoutOptions {
  /** 页面使用的布局名称，默认 'default' */
  layout?: string
}

/**
 * 从布局模块中提取布局信息
 * @param modules - 布局模块映射（文件路径 -> 模块加载器）
 * @returns 布局元数据数组
 */
export const generateLayouts = (modules: LayoutGlobs): LayoutMeta[] => {
  return Object.entries(modules).map(([file, loader]) => {
    // 从文件路径提取布局名称
    // 例如：layouts/default.tsx -> default
    //      layouts/admin.tsx -> admin
    const fileName = file.split('/').pop()?.replace(/\.[^.]+$/, '') || 'default'
    const name = fileName.toLowerCase() === 'index' ? 'default' : fileName
    
    return {
      name,
      file,
      loader,
    }
  })
}

/**
 * 获取布局加载器
 * @param layouts - 布局元数据数组
 * @param layoutName - 布局名称，默认 'default'
 * @returns 布局加载器，如果不存在则返回 null
 */
export const getLayoutLoader = (
  layouts: LayoutMeta[],
  layoutName: string = 'default',
): LayoutLoader | null => {
  const layout = layouts.find((l) => l.name === layoutName)
  return layout?.loader || null
}

