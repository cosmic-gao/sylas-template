# @sylas/route-core

文件路由系统的核心逻辑库。

## 安装

```bash
npm install @sylas/route-core
# 或
pnpm add @sylas/route-core
# 或
yarn add @sylas/route-core
```

## 功能

提供文件路由系统的核心功能：

- **`generateFileRoutes`**: 从文件模块生成路由配置
- **`batchExtractRouteMeta`**: 批量提取路由的 meta 信息
- **路径处理工具**: 路径规范化、参数解析、路由分类等

## API

### `generateFileRoutes(modules, options?)`

从文件模块生成路由配置。这是文件路由系统的核心函数，将文件系统结构转换为路由配置。

**参数：**
- `modules: ModuleGlobs` - 文件模块映射（文件路径 -> 模块加载器）
- `options?: RouteBuildOptions` - 路由构建选项

**返回值：**
- `RouteMeta[]` - 排序后的路由元数据数组（按优先级和路径长度排序）

**示例：**

```typescript
import { generateFileRoutes } from '@sylas/route-core'

const modules = {
  'pages/user/index.tsx': () => import('./pages/user/index.tsx'),
  'pages/user/[id].tsx': () => import('./pages/user/[id].tsx'),
}

const routes = generateFileRoutes(modules, {
  pageRoots: ['pages'],
  kebabKeepDigits: false,
  removeIndex: true,
})

// routes = [
//   { path: '/user', file: 'pages/user/index.tsx', name: 'user', ... },
//   { path: '/user/:id', file: 'pages/user/[id].tsx', name: 'user-id', ... }
// ]
```

### `batchExtractRouteMeta(routes, options?)`

批量提取所有路由的 meta 信息。支持并行提取以提高性能。

**参数：**
- `routes: RouteMeta[]` - 路由元数据数组
- `options?: { parallel?: boolean; concurrency?: number }` - 提取选项
  - `parallel?: boolean` - 是否并行提取，默认 `true`
  - `concurrency?: number` - 并行提取时的并发数，默认 `10`

**返回值：**
- `Promise<RouteMeta[]>` - Promise，解析为包含 meta 的路由数组

**示例：**

```typescript
import { batchExtractRouteMeta } from '@sylas/route-core'

const routesWithMeta = await batchExtractRouteMeta(routes, {
  parallel: true,
  concurrency: 10,
})
```

### `normalizePath(raw, rootMatchers, mapper?, ...)`

规范化文件路径为路由路径。这是路径处理的核心函数。

**参数：**
- `raw: string` - 原始文件路径（如 `pages/user/[id].tsx`）
- `rootMatchers: RegExp[]` - 预编译的根路径匹配器数组
- `mapper?: (segment, ctx) => string | null | undefined` - 自定义段映射函数
- `kebabKeepDigits?: boolean` - 是否在 kebab 转换时保留数字，默认 `false`
- `caseSensitive?: boolean` - 是否大小写敏感，默认 `false`
- `enableCatchAll?: boolean` - 是否支持 catch-all 路由，默认 `true`
- `removeIndex?: boolean` - 是否去除尾部 index，默认 `true`

**返回值：**
- `string` - 规范化后的路由路径（如 `/user/:id`）

**示例：**

```typescript
import { normalizePath, createRootMatchers } from '@sylas/route-core'

const matchers = createRootMatchers(['pages'])
normalizePath('pages/user/[id].tsx', matchers)
// => '/user/:id'

normalizePath('pages/user/[...slug].tsx', matchers)
// => '/user/:slug/*'
```

### `parseParamSegment(segment, enableCatchAll?)`

解析参数段（如 `[id]`、`[id?]`、`[...slug]`）。使用缓存机制避免重复解析。

**参数：**
- `segment: string` - 路径段字符串
- `enableCatchAll?: boolean` - 是否支持 catch-all 路由，默认 `true`

**返回值：**
- `ParsedParamSegment | null` - 解析后的参数信息，如果不是参数段则返回 `null`

**示例：**

```typescript
import { parseParamSegment } from '@sylas/route-core'

parseParamSegment('[id]')
// => { name: 'id', optional: false, catchAll: false }

parseParamSegment('[id?]')
// => { name: 'id', optional: true, catchAll: false }

parseParamSegment('[...slug]')
// => { name: 'slug', optional: false, catchAll: true }

parseParamSegment('user')
// => null
```

### `classifyRoute(path)`

路由分类：静态 < 动态 < catch-all。用于路由排序，确保更具体的路由优先匹配。

**参数：**
- `path: string` - 路由路径

**返回值：**
- `number` - 路由优先级：`0`=静态, `1`=动态, `2`=catch-all

**示例：**

```typescript
import { classifyRoute } from '@sylas/route-core'

classifyRoute('/user/profile')    // => 0 (静态)
classifyRoute('/user/:id')       // => 1 (动态)
classifyRoute('/user/:slug/*')   // => 2 (catch-all)
```

### `compareRoute(a, b)`

比较两个路由的优先级和长度。用于路由排序。

**参数：**
- `a: { path: string }` - 第一个路由
- `b: { path: string }` - 第二个路由

**返回值：**
- `number` - 比较结果：负数表示 `a < b`，正数表示 `a > b`，`0` 表示相等

## 类型定义

### `RouteMeta`

路由元数据接口。

```typescript
interface RouteMeta {
  path: string                    // 路由路径
  file: string                    // 文件路径
  name: string                    // 路由名称（kebab-case）
  loader: () => Promise<{ default: unknown }>  // 模块加载器
  meta?: PageMeta                 // 页面元数据
  metaLoader?: () => Promise<PageMeta | undefined>  // 元数据加载器
}
```

### `RouteBuildOptions`

路由构建选项接口。

```typescript
interface RouteBuildOptions {
  pageRoots?: string[]            // pages 目录别名，默认 ['pages']
  segmentMapper?: (segment, ctx) => string | null | undefined  // 自定义段映射
  kebabKeepDigits?: boolean        // 是否保留数字，默认 false
  removeIndex?: boolean            // 是否去除尾部 index，默认 true
  caseSensitive?: boolean          // 是否大小写敏感，默认 false
  enableCatchAll?: boolean         // 是否支持 catch-all，默认 true
}
```

### `SegmentContext`

段上下文信息接口。

```typescript
interface SegmentContext {
  index: number                    // 当前段的索引
  totalSegments: number            // 总段数
  isFirst: boolean                 // 是否为第一段
  isLast: boolean                  // 是否为最后一段
  fullPath: string                 // 完整路径
}
```

## 使用场景

### 基本路由生成

```typescript
import { generateFileRoutes } from '@sylas/route-core'

const modules = import.meta.glob('./pages/**/*.tsx')
const routes = generateFileRoutes(modules, {
  pageRoots: ['pages'],
})
```

### 自定义段映射

```typescript
import { generateFileRoutes, type SegmentContext } from '@sylas/route-core'

const routes = generateFileRoutes(modules, {
  segmentMapper: (segment, ctx: SegmentContext) => {
    // 自定义映射逻辑
    if (segment === 'admin') return 'admin-panel'
    return null // 使用默认逻辑
  },
})
```

### 提取路由 Meta

```typescript
import { generateFileRoutes, batchExtractRouteMeta } from '@sylas/route-core'

const routes = generateFileRoutes(modules)
const routesWithMeta = await batchExtractRouteMeta(routes, {
  parallel: true,
  concurrency: 10,
})
```

## 类型支持

完整的 TypeScript 类型定义已包含在包中，无需额外安装类型包。

## 许可证

MIT

## 相关包

- [`@sylas/route-shared`](../shared/README.md) - 共享工具函数
- [`@sylas/route-react`](../adapter/react/README.md) - React 适配器
- [`@sylas/route-vite-compiler`](../compiler/vite/README.md) - Vite 编译器

