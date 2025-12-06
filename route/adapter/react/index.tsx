import { createBrowserRouter, RouterProvider, useLocation, type RouteObject } from 'react-router-dom'
import React, { Suspense, lazy, useEffect, useState, Component, useRef, type ComponentType } from 'react'
import {
  generateFileRoutes,
  definePageMeta,
  batchExtractRouteMeta,
  type ModuleGlobs,
  type RouteBuildOptions,
  type RouteMeta,
  type PageMeta,
} from '../../core/index.js'
import { LayoutWrapper } from '@sylas/layout-react'
import { generateLayouts, getLayoutLoader, type LayoutGlobs } from '@sylas/layout-core'

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
 * 动态布局包装器 - 根据页面 meta 选择布局
 * 优化：只在布局名称变化时重新创建布局组件，避免路由切换时的闪烁
 */
function DynamicLayoutWrapper({
  children,
  metaLoader,
  layouts,
  fallback,
  routeKey,
}: {
  children: React.ReactNode
  metaLoader?: () => Promise<{ layout?: string; [key: string]: unknown } | undefined>
  layouts: ReturnType<typeof generateLayouts>
  fallback: React.ReactNode
  routeKey: string
}) {
  const location = useLocation()
  const [layoutLoader, setLayoutLoader] = React.useState<(() => Promise<{ default: ComponentType<any> }>) | null>(null)
  const [layoutName, setLayoutName] = React.useState<string>('default')
  const prevLayoutNameRef = React.useRef<string>('')

  React.useEffect(() => {
    let canceled = false
    const loadLayout = async () => {
      try {
        const meta = await metaLoader?.()
        if (canceled) return
        
        const newLayoutName = meta?.layout || 'default'
        // 只在布局名称变化时才更新布局加载器
        if (newLayoutName !== prevLayoutNameRef.current) {
          const loader = getLayoutLoader(layouts, newLayoutName)
          setLayoutLoader(() => loader)
          setLayoutName(newLayoutName)
          prevLayoutNameRef.current = newLayoutName
        }
      } catch (error) {
        console.error('[route-react] Failed to load page meta:', error)
        // 使用默认布局
        if (prevLayoutNameRef.current !== 'default') {
          const defaultLoader = getLayoutLoader(layouts, 'default')
          setLayoutLoader(() => defaultLoader)
          setLayoutName('default')
          prevLayoutNameRef.current = 'default'
        }
      }
    }
    
    loadLayout()
    
    return () => {
      canceled = true
    }
  }, [metaLoader, layouts, routeKey, location.pathname])

  if (!layoutLoader) {
    return <>{children}</>
  }

  // 使用布局名称作为 key，只在布局变化时重新创建布局组件
  // 这样相同布局的路由切换时，布局组件保持稳定，只更新 children
  return (
    <LayoutWrapper 
      key={layoutName} 
      layoutLoader={layoutLoader} 
      fallback={fallback}
    >
      {children}
    </LayoutWrapper>
  )
}

/**
 * 创建路由元素包装器
 */
function createRouteElement(
  LazyComponent: React.LazyExoticComponent<ComponentType>,
  metaLoader: (() => Promise<{ title?: string; layout?: string; [key: string]: unknown } | undefined>) | undefined,
  routeName: string,
  defaultTitle: string,
  suspenseFallback: React.ReactNode,
  ErrorBoundary: React.ComponentType<{ children: React.ReactNode }>,
  layouts: ReturnType<typeof generateLayouts>,
  routeKey: string,
) {
  const pageContent = (
    <ErrorBoundary>
      <RouteWrapper metaLoader={metaLoader} routeName={routeName} defaultTitle={defaultTitle}>
        <Suspense fallback={suspenseFallback}>
          <LazyComponent />
        </Suspense>
      </RouteWrapper>
    </ErrorBoundary>
  )

  // 如果有布局系统，使用动态布局包装器
  if (layouts.length > 0) {
    return (
      <DynamicLayoutWrapper 
        metaLoader={metaLoader} 
        layouts={layouts} 
        fallback={suspenseFallback}
        routeKey={routeKey}
      >
        {pageContent}
      </DynamicLayoutWrapper>
    )
  }

  return pageContent
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

  // 处理布局模块
  let layouts: ReturnType<typeof generateLayouts> = []
  if (options?.layoutModules) {
    layouts = generateLayouts(options.layoutModules)
  }

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
        layouts,
        file, // 传递文件路径作为 routeKey
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

