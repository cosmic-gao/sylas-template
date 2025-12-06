import React, { Suspense, lazy, useMemo, type ComponentType } from 'react'
import type { LayoutLoader } from '../../core/index.js'

export interface LayoutWrapperProps {
  layoutLoader: LayoutLoader | null
  children: React.ReactNode
  fallback?: React.ReactNode
  key?: string
}

/**
 * 布局包装器组件
 * 根据布局加载器动态加载并渲染布局组件
 * 优化：使用稳定的 key 来保持布局组件实例，避免不必要的重新渲染
 */
export function LayoutWrapper({
  layoutLoader,
  children,
  fallback = <div>布局加载中...</div>,
  key,
}: LayoutWrapperProps) {
  // 如果没有布局加载器，直接渲染子组件
  if (!layoutLoader) {
    return <>{children}</>
  }

  // 使用 useMemo 缓存 lazy 组件，只在 layoutLoader 变化时重新创建
  // key 用于区分不同的布局实例，但不应该频繁变化
  const LazyLayout = useMemo(
    () => lazy(layoutLoader as () => Promise<{ default: ComponentType<any> }>),
    [layoutLoader]
  )

  // 使用 key 来保持布局组件的稳定性，children 变化时只更新内容部分
  return (
    <Suspense fallback={fallback}>
      <LazyLayout key={key}>{children}</LazyLayout>
    </Suspense>
  )
}

/**
 * 创建布局包装器
 * @param layoutLoader - 布局加载器
 * @param fallback - 加载时的回退组件
 * @returns 布局包装器组件
 */
export function createLayoutWrapper(
  layoutLoader: LayoutLoader | null,
  fallback?: React.ReactNode,
) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <LayoutWrapper layoutLoader={layoutLoader} fallback={fallback}>
        {children}
      </LayoutWrapper>
    )
  }
}

