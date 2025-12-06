/// <reference types="vite/client" />

// 虚拟模块类型声明
declare module 'virtual:@sylas/route-routes' {
  import type { ComponentType } from 'react'
  import type { createBrowserRouter } from 'react-router-dom'

  export function getPageModules(): Record<string, () => Promise<{ default: ComponentType }>>

  export function createRouter(options?: any): {
    router: ReturnType<typeof createBrowserRouter>
    routes: unknown[]
  }
}

declare module 'virtual:@sylas/layout-app' {
  import type { ComponentType } from 'react'
  const App: ComponentType
  export default App
}

declare module 'virtual:@sylas/layout-main' {
  // main.tsx 是副作用模块，不需要导出
}

declare module 'virtual:@sylas/layout-layouts' {
  export function getLayoutModules(): Record<string, () => Promise<{ default: any }>>
  export function getLayoutLoader(layoutName?: string): (() => Promise<{ default: any }>) | null
}
