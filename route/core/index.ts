import {
  type SegmentContext,
  createRootMatchers,
  normalizePath,
  compareRoute,
  buildRouteName,
  classifyRoute,
} from './utils.js'

export type PageMeta = Record<string, unknown>

export interface RouteMeta {
  path: string
  file: string
  name: string
  loader: () => Promise<{ default: unknown }>
  meta?: PageMeta
  metaLoader?: () => Promise<PageMeta | undefined>
}

export type ModuleLoader = () => Promise<{ default: unknown }>
export type ModuleGlobs = Record<string, ModuleLoader>

export interface RouteBuildOptions {
  /**
   * pages 目录别名（多根目录支持），默认 ['pages']
   */
  pageRoots?: string[]
  /**
   * 片段映射自定义规则，返回 null/undefined 时使用默认逻辑
   */
  segmentMapper?: (segment: string, ctx: SegmentContext) => string | null | undefined
  /**
   * toKebab 是否保留数字，默认 false
   */
  kebabKeepDigits?: boolean
  /**
   * 是否去除尾部 index 文件，默认 true
   */
  removeIndex?: boolean
  /**
   * 是否大小写敏感，默认 false（路径转换为小写）
   */
  caseSensitive?: boolean
  /**
   * 是否支持 catch-all 路由（[...slug]），默认 true
   */
  enableCatchAll?: boolean
}

export const definePageMeta = <T extends PageMeta>(meta: T): T => meta

// 重新导出工具函数
export type { SegmentContext } from './utils.js'
export {
  createRootMatchers,
  parseParamSegment,
  mapStaticSegment,
  mapParamSegment,
  mapCustomSegment,
  mapSegmentToPathPart,
  processPathSegments,
  buildNormalizedSegments,
  normalizePath,
  classifyRoute,
  compareRoute,
  buildRouteName,
} from './utils.js'

// 从 shared 重新导出通用工具
export { toKebab } from '../shared/index.js'

const DEFAULT_PAGE_ROOTS = ['pages']

/**
 * 从模块加载器中提取页面元数据
 * 支持两种导出方式：
 * 1. definePageMeta() 函数调用
 * 2. pageMeta 对象导出
 * @param loader - 模块加载器函数
 * @returns 页面元数据，如果不存在或提取失败则返回 undefined
 */
const extractPageMeta = async (loader: ModuleLoader): Promise<PageMeta | undefined> => {
  try {
    const mod = await loader()
    // 使用更严格的类型定义，避免使用 any
    const modRecord = mod as Record<string, unknown>
    const metaExport = modRecord.pageMeta
    const metaFn = modRecord.definePageMeta

    // 优先检查 definePageMeta 函数
    if (typeof metaFn === 'function') {
      const res = metaFn()
      return res instanceof Promise ? await res : (res as PageMeta)
    }

    // 回退到 pageMeta 对象导出
    if (metaExport && typeof metaExport === 'object' && metaExport !== null) {
      return metaExport as PageMeta
    }
  } catch (err) {
    console.warn('[route-core] extractPageMeta failed:', err)
  }
  return undefined
}

/**
 * 批量提取所有路由的 meta 信息
 * 支持并行提取以提高性能
 * @param routes - 路由元数据数组
 * @param options - 提取选项
 * @returns Promise，解析为包含 meta 的路由数组
 */
export const batchExtractRouteMeta = async (
  routes: RouteMeta[],
  options?: {
    /**
     * 是否并行提取，默认 true
     */
    parallel?: boolean
    /**
     * 并行提取时的并发数，默认 10
     */
    concurrency?: number
  },
): Promise<RouteMeta[]> => {
  const parallel = options?.parallel ?? true
  const concurrency = options?.concurrency ?? 10

  if (!parallel) {
    // 串行提取
    const results: RouteMeta[] = []
    for (const route of routes) {
      const meta = route.metaLoader ? await route.metaLoader() : undefined
      results.push({ ...route, meta })
    }
    return results
  }

  // 并行提取，使用并发控制
  const results: RouteMeta[] = []
  const tasks: Promise<void>[] = []
  let currentIndex = 0

  const processNext = async (): Promise<void> => {
    while (currentIndex < routes.length) {
      const index = currentIndex++
      const route = routes[index]
      if (route.metaLoader) {
        try {
          const meta = await route.metaLoader()
          results[index] = { ...route, meta }
        } catch (err) {
          console.warn(`[route-core] batchExtractRouteMeta failed for route: ${route.path}`, err)
          results[index] = { ...route, meta: undefined }
        }
      } else {
        results[index] = { ...route, meta: undefined }
      }
    }
  }

  // 启动并发任务
  for (let i = 0; i < Math.min(concurrency, routes.length); i++) {
    tasks.push(processNext())
  }

  await Promise.all(tasks)
  return results
}

/**
 * 主函数：从文件模块生成路由配置
 * metaLoader 采用延迟执行策略，支持后续的 worker 并行化处理
 * @param modules - 文件模块映射（文件路径 -> 模块加载器）
 * @param options - 路由构建选项
 * @returns 排序后的路由元数据数组
 */
export const generateFileRoutes = (
  modules: ModuleGlobs,
  options?: RouteBuildOptions,
): RouteMeta[] => {
  const pageRoots = options?.pageRoots?.length ? options.pageRoots : DEFAULT_PAGE_ROOTS
  const rootMatchers = createRootMatchers(pageRoots)
  const mapper = options?.segmentMapper
  const kebabKeepDigits = options?.kebabKeepDigits ?? false
  const caseSensitive = options?.caseSensitive ?? false
  const enableCatchAll = options?.enableCatchAll ?? true
  const removeIndex = options?.removeIndex ?? true

  return Object.entries(modules)
    .map(([file, loader]) => {
      const path = normalizePath(file, rootMatchers, mapper, kebabKeepDigits, caseSensitive, enableCatchAll, removeIndex)
      return {
        file,
        loader,
        path,
        name: buildRouteName(file, path, kebabKeepDigits),
        // metaLoader 延迟执行，支持后续 worker 并行化处理
        metaLoader: () => extractPageMeta(loader),
      }
    })
    .sort(compareRoute)
}

