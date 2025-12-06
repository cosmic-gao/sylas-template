import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import React, { Suspense, lazy, useEffect, Component, useRef, type ComponentType } from 'react'
import {
  generateFileRoutes,
  definePageMeta,
  batchExtractRouteMeta,
  type ModuleGlobs,
  type RouteBuildOptions,
  type RouteMeta,
  type PageMeta,
} from '../../core/index.js'

// 重新导出常用 API，方便页面文件使用
export { definePageMeta, generateFileRoutes, batchExtractRouteMeta }
export type { PageMeta, RouteMeta, ModuleGlobs, RouteBuildOptions }

export interface ReactRouterOptions extends RouteBuildOptions {
  /**
   * Suspense fallback 组件，默认显示 "页面加载中..."
   */
  suspenseFallback?: React.ReactNode
  /**
   * 错误边界组件，默认显示错误信息
   */
  errorBoundary?: React.ComponentType<{ children: React.ReactNode }>
  /**
   * 默认页面标题后缀
   */
  defaultTitle?: string
}

const DEFAULT_TITLE = 'Sylas Template'

interface RouteWrapperProps {
  metaLoader?: () => Promise<{ title?: string; [key: string]: unknown } | undefined>
  routeName: string
  defaultTitle: string
  children: React.ReactNode
}

function RouteWrapper({ metaLoader, routeName, defaultTitle, children }: RouteWrapperProps) {
  useEffect(() => {
    let canceled = false
    const applyMeta = async () => {
      let title: string | undefined
      try {
        const meta = await metaLoader?.()
        if (canceled) return
        if (meta && typeof meta.title === 'string') {
          title = meta.title
        }
      } catch (err) {
        console.warn('[route-react] apply meta failed', err)
      }

      if (!title) {
        title = routeName ? `${routeName} | ${defaultTitle}` : defaultTitle
      }
      document.title = title
    }

    applyMeta()
    return () => {
      canceled = true
    }
  }, [metaLoader, routeName, defaultTitle])

  return <>{children}</>
}

class DefaultErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  state: { hasError: boolean; error?: Error } = { hasError: false, error: undefined }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error: error instanceof Error ? error : new Error(String(error)) }
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('[route-react] render error', error, info)
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message ?? '未知错误'
      return (
        <div style={{ padding: 16 }}>
          <h2>页面加载失败</h2>
          <p>{errorMessage}</p>
          <button onClick={() => this.setState({ hasError: false, error: undefined })}>
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

/**
 * 创建路由元素包装器
 */
function createRouteElement(
  LazyComponent: React.LazyExoticComponent<ComponentType>,
  metaLoader: (() => Promise<{ title?: string; [key: string]: unknown } | undefined>) | undefined,
  routeName: string,
  defaultTitle: string,
  suspenseFallback: React.ReactNode,
  ErrorBoundary: React.ComponentType<{ children: React.ReactNode }>,
) {
  return (
    <ErrorBoundary>
      <RouteWrapper metaLoader={metaLoader} routeName={routeName} defaultTitle={defaultTitle}>
        <Suspense fallback={suspenseFallback}>
          <LazyComponent />
        </Suspense>
      </RouteWrapper>
    </ErrorBoundary>
  )
}

/**
 * 根据文件自动生成 React Router 配置
 */
export function createReactRouter(
  modules: ModuleGlobs,
  options?: ReactRouterOptions,
): {
  router: ReturnType<typeof createBrowserRouter>
  routes: RouteMeta[]
} {
  const pageRoutes = generateFileRoutes(modules, options)
  const defaultTitle = options?.defaultTitle ?? DEFAULT_TITLE
  const suspenseFallback = options?.suspenseFallback ?? <div>页面加载中...</div>
  const ErrorBoundary = options?.errorBoundary ?? DefaultErrorBoundary

  // 预先创建所有 lazy 组件
  const lazyComponents = new Map<string, React.LazyExoticComponent<ComponentType>>(
    pageRoutes.map((route: RouteMeta) => [
      route.file,
      lazy(route.loader as () => Promise<{ default: ComponentType }>),
    ]),
  )

  const routeObjects: RouteObject[] = pageRoutes.map(({ path, file, metaLoader, name }: RouteMeta) => {
    const routePath = path || '/'
    const routeName = name || routePath.replace(/^\//, '')
    const LazyComponent = lazyComponents.get(file)

    if (!LazyComponent) {
      console.error(`[route-react] lazy component not found for file: ${file}`)
      return {
        path: routePath,
        element: React.createElement('div', null, '路由组件未找到'),
      }
    }

    return {
      path: routePath,
      element: createRouteElement(
        LazyComponent,
        metaLoader,
        routeName,
        defaultTitle,
        suspenseFallback,
        ErrorBoundary,
      ),
    }
  })

  const router = createBrowserRouter(routeObjects)

  return { router, routes: pageRoutes }
}

/**
 * 根据文件自动生成并渲染 React Router Provider
 */
export function FileRouter({
  modules,
  options,
}: {
  modules: ModuleGlobs
  options?: ReactRouterOptions
}) {
  // 使用 useRef 确保 router 只创建一次
  // modules 通常来自 import.meta.glob，是稳定的引用
  const routerRef = useRef<ReturnType<typeof createBrowserRouter> | undefined>(undefined)
  
  if (!routerRef.current) {
    routerRef.current = createReactRouter(modules, options).router
  }

  return <RouterProvider router={routerRef.current} />
}

