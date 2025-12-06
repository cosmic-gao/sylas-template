import { toKebab } from '../shared/index.js'

export type PageMeta = Record<string, unknown>

export interface SegmentContext {
  index: number
  totalSegments: number
  isFirst: boolean
  isLast: boolean
  fullPath: string
}

/**
 * 匹配参数段格式：[...slug]、[id]、[id?] 等
 * 捕获组 1: 参数体内容
 */
const PARAM_SEGMENT_REGEX = /^\[(.+)]$/

/**
 * 解析参数段详细信息
 * 命名捕获组：
 * - catch: catch-all 标记 (...)
 * - name: 参数名称
 * - optional: 可选标记 (?)
 * - type: 类型标记 (:type)
 * 示例：...slug -> {catch: '...', name: 'slug'}
 *       id? -> {name: 'id', optional: '?'}
 *       id:number -> {name: 'id', type: 'number'}
 */
const PARAM_DETAIL_REGEX =
  /^(?<catch>\.\.\.)?(?<name>[a-zA-Z0-9_]+)(?<optional>\?)?(?::(?<type>[a-zA-Z0-9_]+))?$/

/**
 * 匹配路由组格式：(group)
 * 路由组用于组织文件但不影响路径结构
 */
const ROUTE_GROUP_REGEX = /^\(.+\)$/

const ROUTE_PRIORITY = {
  STATIC: 0,
  DYNAMIC: 1,
  CATCH_ALL: 2,
} as const

export const createDefaultSegmentContext = (): SegmentContext => ({
  index: 0,
  totalSegments: 0,
  isFirst: false,
  isLast: false,
  fullPath: '',
})

// toKebab 已移至 shared，从 shared 导入

/**
 * 预编译 pageRoots 正则表达式数组
 * @param pageRoots - pages 目录别名数组
 * @returns 编译后的正则表达式数组，用于匹配路径前缀
 */
export const createRootMatchers = (pageRoots: string[]): RegExp[] =>
  pageRoots.map((root) => new RegExp(`^[./\\\\]*${root}[\\\\/]`, 'i'))

interface ParsedParamSegment {
  name: string
  optional: boolean
  catchAll: boolean
  type?: string
}

/**
 * 参数解析缓存，避免重复解析相同的参数段
 */
const paramSegmentCache = new Map<string, ParsedParamSegment | null>()

/**
 * 解析参数段（如 [id]、[id?]、[...slug]）
 * 使用缓存机制避免重复解析
 * @param segment - 路径段字符串
 * @param enableCatchAll - 是否支持 catch-all 路由
 * @returns 解析后的参数信息，如果不是参数段则返回 null
 */
export const parseParamSegment = (segment: string, enableCatchAll = true): ParsedParamSegment | null => {
  // 检查缓存
  const cacheKey = `${segment}:${enableCatchAll}`
  if (paramSegmentCache.has(cacheKey)) {
    return paramSegmentCache.get(cacheKey) ?? null
  }

  const body = segment.match(PARAM_SEGMENT_REGEX)?.[1]
  if (!body) {
    paramSegmentCache.set(cacheKey, null)
    return null
  }

  const match = body.match(PARAM_DETAIL_REGEX)
  if (!match || !match.groups) {
    paramSegmentCache.set(cacheKey, null)
    return null
  }

  const name = match.groups.name
  const optional = Boolean(match.groups.optional)
  const catchAll = match.groups.catch === '...'
  const type = match.groups.type

  // 如果不支持 catch-all 但检测到 catch-all，返回 null
  if (catchAll && !enableCatchAll) {
    paramSegmentCache.set(cacheKey, null)
    return null
  }

  const result = { name, optional, catchAll, type }
  paramSegmentCache.set(cacheKey, result)
  return result
}

/**
 * 映射静态段（非参数段）为路径部分
 * @param segment - 路径段字符串
 * @param kebabKeepDigits - 是否在 kebab 转换时保留数字
 * @param caseSensitive - 是否大小写敏感
 * @returns 转换后的路径部分
 */
export const mapStaticSegment = (segment: string, kebabKeepDigits: boolean, caseSensitive: boolean): string => {
  if (caseSensitive) {
    // 大小写敏感时，只做基本的驼峰转换，不转小写
    const disallowed = kebabKeepDigits ? /[^a-zA-Z0-9-]+/g : /[^a-zA-Z-]+/g
    return segment
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[_\s]+/g, '-')
      .replace(disallowed, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
  return toKebab(segment, kebabKeepDigits)
}

/**
 * 映射参数段为路径部分
 * @param parsed - 解析后的参数段信息
 * @returns 路径参数格式（如 :id、:id?、:slug/*）
 */
export const mapParamSegment = (parsed: ParsedParamSegment): string => {
  if (parsed.catchAll) return `:${parsed.name}/*`
  if (parsed.optional) return `:${parsed.name}?`
  return `:${parsed.name}`
}

/**
 * 映射自定义段（通过自定义 mapper）
 * @param segment - 路径段字符串
 * @param mapper - 自定义映射函数
 * @param ctx - 段上下文信息
 * @returns 自定义映射结果，如果没有映射则返回 null
 */
export const mapCustomSegment = (
  segment: string,
  mapper: ((segment: string, ctx: SegmentContext) => string | null | undefined) | undefined,
  ctx: SegmentContext,
): string | null => {
  const custom = mapper?.(segment, ctx)
  if (typeof custom === 'string' && custom.length) return custom
  return null
}

/**
 * 将 segment 映射为 path 部分
 * 按优先级处理：自定义映射 > 参数段 > 静态段
 * @param segment - 路径段字符串
 * @param mapper - 自定义段映射函数
 * @param ctx - 段上下文信息
 * @param kebabKeepDigits - 是否在 kebab 转换时保留数字
 * @param caseSensitive - 是否大小写敏感
 * @param enableCatchAll - 是否支持 catch-all 路由
 * @returns 映射后的路径部分
 */
export const mapSegmentToPathPart = (
  segment: string,
  mapper: ((segment: string, ctx: SegmentContext) => string | null | undefined) | undefined,
  ctx: SegmentContext | undefined,
  kebabKeepDigits: boolean,
  caseSensitive: boolean,
  enableCatchAll: boolean,
): string => {
  const context = ctx ?? createDefaultSegmentContext()

  // 优先使用自定义映射
  const custom = mapCustomSegment(segment, mapper, context)
  if (custom !== null) return custom

  // 处理参数段
  const parsed = parseParamSegment(segment, enableCatchAll)
  if (parsed) {
    return mapParamSegment(parsed)
  }

  // 默认处理静态段
  return mapStaticSegment(segment, kebabKeepDigits, caseSensitive)
}

/**
 * 一次性处理路径：去除 pages 前缀、文件扩展名、分割段、过滤路由组、去除尾部 index
 * 使用单个正则表达式减少多次字符串和数组操作
 * @param raw - 原始文件路径
 * @param rootMatchers - 预编译的根路径匹配器数组
 * @param removeIndex - 是否去除尾部 index
 * @returns 处理后的路径段数组（已去除尾部 index）
 */
export const processPathSegments = (raw: string, rootMatchers: RegExp[], removeIndex: boolean): string[] => {
  // 统一路径分隔符并去除文件扩展名
  let processed = raw.replace(/\\/g, '/').replace(/\.[a-zA-Z0-9]+$/, '')

  // 查找匹配的根路径并去除前缀
  const matched = rootMatchers.find((regex) => regex.test(processed))
  if (matched) {
    processed = processed.replace(matched, '')
  } else {
    // 如果没有匹配的根路径，去除前导的 ./ 或 ../
    processed = processed.replace(/^[./\\]*/, '')
  }

  // 一次性分割、过滤空段、过滤路由组、去除尾部 index
  const segments = processed
    .split('/')
    .filter(Boolean)
    .filter((segment) => !ROUTE_GROUP_REGEX.test(segment))

  // 去除尾部 index（如果存在且配置允许）
  if (removeIndex && segments.length > 0 && segments[segments.length - 1].toLowerCase() === 'index') {
    segments.pop()
  }

  return segments
}

/**
 * 构建规范化路径段数组
 * 为每个段创建上下文信息并映射为路径部分
 * @param segments - 原始路径段数组
 * @param mapper - 自定义段映射函数
 * @param kebabKeepDigits - 是否在 kebab 转换时保留数字
 * @param caseSensitive - 是否大小写敏感
 * @param enableCatchAll - 是否支持 catch-all 路由
 * @returns 规范化后的路径段数组
 */
export const buildNormalizedSegments = (
  segments: string[],
  mapper: ((segment: string, ctx: SegmentContext) => string | null | undefined) | undefined,
  kebabKeepDigits: boolean,
  caseSensitive: boolean,
  enableCatchAll: boolean,
): string[] => {
  const totalSegments = segments.length
  const fullPath = segments.join('/')
  return segments.map((segment, idx) =>
    mapSegmentToPathPart(
      segment,
      mapper,
      {
        index: idx,
        totalSegments,
        isFirst: idx === 0,
        isLast: idx === totalSegments - 1,
        fullPath,
      },
      kebabKeepDigits,
      caseSensitive,
      enableCatchAll,
    ),
  )
}

/**
 * 规范化文件路径为路由路径
 * @param raw - 原始文件路径
 * @param rootMatchers - 预编译的根路径匹配器数组
 * @param mapper - 自定义段映射函数
 * @param kebabKeepDigits - 是否在 kebab 转换时保留数字
 * @param caseSensitive - 是否大小写敏感
 * @param enableCatchAll - 是否支持 catch-all 路由
 * @param removeIndex - 是否去除尾部 index
 * @returns 规范化后的路由路径
 */
export const normalizePath = (
  raw: string,
  rootMatchers: RegExp[],
  mapper?: ((segment: string, ctx: SegmentContext) => string | null | undefined),
  kebabKeepDigits = false,
  caseSensitive = false,
  enableCatchAll = true,
  removeIndex = true,
): string => {
  // 一次性处理路径：去除前缀、分割段、过滤、去除尾部 index
  const segments = processPathSegments(raw, rootMatchers, removeIndex)

  if (!segments.length) return '/'

  const normalizedSegments = buildNormalizedSegments(segments, mapper, kebabKeepDigits, caseSensitive, enableCatchAll)
  return `/${normalizedSegments.join('/')}`
}

/**
 * 路由分类：静态 < 动态 < catch-all
 * 用于路由排序，确保更具体的路由优先匹配
 * @param path - 路由路径
 * @returns 路由优先级：0=静态, 1=动态, 2=catch-all
 */
export const classifyRoute = (path: string): number => {
  const segments = path.split('/').filter(Boolean)
  if (segments.some((s) => s.endsWith('*'))) return ROUTE_PRIORITY.CATCH_ALL
  if (segments.some((s) => s.startsWith(':'))) return ROUTE_PRIORITY.DYNAMIC
  return ROUTE_PRIORITY.STATIC
}

/**
 * 比较两个路由的优先级和长度
 * @param a - 第一个路由
 * @param b - 第二个路由
 * @returns 比较结果：负数表示 a < b，正数表示 a > b
 */
export const compareRoute = (a: { path: string }, b: { path: string }): number => {
  const delta = classifyRoute(a.path) - classifyRoute(b.path)
  if (delta !== 0) return delta
  return a.path.length - b.path.length
}

/**
 * 生成路由名称
 * 从路径中提取名称，去除参数和特殊字符，转换为 kebab-case
 * @param file - 文件路径（作为后备）
 * @param path - 路由路径
 * @param kebabKeepDigits - 是否在 kebab 转换时保留数字
 * @returns 路由名称（kebab-case）
 */
export const buildRouteName = (file: string, path: string, kebabKeepDigits = false): string => {
  // 从路径中提取名称：去除前导 /、参数标记（:、*）、多个斜杠
  const nameFromPath = path.replace(/^\//, '').replace(/[:*]+/g, '').replace(/\/+/g, '-')
  if (nameFromPath) return toKebab(nameFromPath, kebabKeepDigits)
  // 后备：使用文件名（去除扩展名）
  const fallback = file.split('/').pop() ?? file
  return toKebab(fallback.replace(/\.[^.]+$/, ''), kebabKeepDigits)
}

