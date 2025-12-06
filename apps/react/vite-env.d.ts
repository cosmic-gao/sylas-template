/// <reference types="vite/client" />

// 虚拟模块类型声明
declare module 'virtual:@sylas/route-routes' {
  import type { ComponentType } from 'react'
  import type { createBrowserRouter } from 'react-router-dom'

  export function getPageModules(): Record<string, () => Promise<{ default: ComponentType }>>

  export function createRouter(): {
    router: ReturnType<typeof createBrowserRouter>
    routes: unknown[]
  }
}
