import type { Plugin } from 'vite'
import type { RouteBuildOptions } from '@sylas/route-core'
import type { ReactRouterOptions } from '@sylas/route-react'
import { toAbsolutePaths } from '@sylas/route-shared'

export interface ViteReactCompilerOptions extends RouteBuildOptions {
  /** 页面文件匹配模式，默认包含 pages 和 app-pages 目录 */
  pagePatterns?: string[]
  /** React Router 选项（包括 defaultTitle 等） */
  routerOptions?: ReactRouterOptions
}

const VIRTUAL_ROUTE_MODULE_ID = 'virtual:@sylas/route-routes'
const RESOLVED_ROUTE_MODULE_ID = '\0' + VIRTUAL_ROUTE_MODULE_ID

/**
 * Vite 插件：自动生成 React 路由配置
 */
export function viteReactCompiler(options: ViteReactCompilerOptions = {}): Plugin {
  const {
    pagePatterns = ['./pages/**/*.{tsx,jsx}', './app-pages/**/*.{tsx,jsx}'],
    routerOptions = {},
    ...routeBuildOptions
  } = options

  let routesCode = ''

  const generateRoutes = () => {
    try {
      // 生成虚拟模块代码，在运行时通过 import.meta.glob 获取页面模块
      const routerOptionsStr = JSON.stringify(routerOptions || {}, null, 2)
      const routeBuildOptionsStr = JSON.stringify(routeBuildOptions || {}, null, 2)

      // 将相对路径转换为绝对路径（虚拟模块要求）
      const absolutePatterns = toAbsolutePaths(pagePatterns)

      routesCode = `// 自动生成的路由配置
import { createReactRouter } from '@sylas/route-react'

// 在运行时通过 import.meta.glob 获取页面模块
export function getPageModules() {
  const pageModules = {
${absolutePatterns
  .map(
    (pattern) =>
      `    ...import.meta.glob(${JSON.stringify(pattern)})`,
  )
  .join(',\n')}
  }
  
  return pageModules
}

// 创建路由配置
export function createRouter() {
  const pageModules = getPageModules()
  const routeBuildOptions = ${routeBuildOptionsStr}
  const routerOptions = ${routerOptionsStr}
  return createReactRouter(pageModules, {
    ...routeBuildOptions,
    ...routerOptions,
  })
}
`
    } catch (error) {
      console.error('[route-vite-react-compiler] Failed to generate routes:', error)
      routesCode = 'export const routes = []'
    }
  }

  // 立即生成一次，确保初始状态有代码
  generateRoutes()

  return {
    name: '@sylas/route-vite-react-compiler',
    enforce: 'pre',
    resolveId(id) {
      if (id === VIRTUAL_ROUTE_MODULE_ID) {
        return RESOLVED_ROUTE_MODULE_ID
      }
      return null
    },
    load(id) {
      if (id === RESOLVED_ROUTE_MODULE_ID) {
        return routesCode || 'export const routes = []'
      }
      return null
    },
    configResolved() {
      // 在配置解析后生成路由配置
      generateRoutes()
    },
    buildStart() {
      // 在构建时也生成一次，确保代码存在
      generateRoutes()
    },
    handleHotUpdate({ file, server }) {
      // 文件变化时重新生成路由
      const isPageFile = pagePatterns.some((pattern) => {
        const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'))
        return regex.test(file)
      })

      if (isPageFile) {
        generateRoutes()
        // 通知客户端更新虚拟模块
        const module = server.moduleGraph.getModuleById(RESOLVED_ROUTE_MODULE_ID)
        if (module) {
          server.moduleGraph.invalidateModule(module)
          return [module]
        }
      }
    },
  }
}
