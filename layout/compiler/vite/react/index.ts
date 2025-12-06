import type { Plugin } from 'vite'
import { toAbsolutePaths } from '@sylas/route-shared'

const VIRTUAL_APP_MODULE_ID = 'virtual:@sylas/layout-app'
const RESOLVED_APP_MODULE_ID = '\0' + VIRTUAL_APP_MODULE_ID

const VIRTUAL_MAIN_MODULE_ID = 'virtual:@sylas/layout-main'
const RESOLVED_MAIN_MODULE_ID = '\0' + VIRTUAL_MAIN_MODULE_ID

const VIRTUAL_LAYOUTS_MODULE_ID = 'virtual:@sylas/layout-layouts'
const RESOLVED_LAYOUTS_MODULE_ID = '\0' + VIRTUAL_LAYOUTS_MODULE_ID

/**
 * Vite 插件：自动生成 React 应用入口和布局系统
 */
export function viteReactLayoutCompiler(options?: {
  layoutPatterns?: string[]
  rootId?: string
  strictMode?: boolean
}): Plugin {
  const {
    layoutPatterns = ['./layouts/**/*.{tsx,jsx}'],
    rootId = 'root',
    strictMode = true,
  } = options || {}

  let appCode = ''
  let mainCode = ''
  let layoutsCode = ''

  const generateCode = () => {
    try {
      // 将相对路径转换为绝对路径（虚拟模块要求）
      const absoluteLayoutPatterns = toAbsolutePaths(layoutPatterns)

      // 生成布局模块代码
      layoutsCode = `// 自动生成的布局模块
// 在运行时通过 import.meta.glob 获取布局模块
export function getLayoutModules() {
  const layoutModules = {
${absoluteLayoutPatterns
  .map(
    (pattern) =>
      `    ...import.meta.glob(${JSON.stringify(pattern)})`,
  )
  .join(',\n')}
  }
  
  return layoutModules
}

// 获取布局加载器
export function getLayoutLoader(layoutName = 'default') {
  const modules = getLayoutModules()
  // 查找匹配的布局文件
  // layouts/default.tsx -> default
  // layouts/admin.tsx -> admin
  // layouts/index.tsx -> default
  const layoutFile = Object.keys(modules).find((file) => {
    const fileName = file.split('/').pop()?.replace(/\.[^.]+$/, '') || ''
    const name = fileName.toLowerCase() === 'index' ? 'default' : fileName
    return name === layoutName
  })
  
  return layoutFile ? modules[layoutFile] : null
}
`

      // 生成 App.tsx 代码（使用 React.createElement 避免 JSX 解析问题）
      appCode = `// 自动生成的 App 组件
import React from 'react'
import { createRouter } from 'virtual:@sylas/route-routes'
import { RouterProvider } from 'react-router-dom'
import { getLayoutModules } from 'virtual:@sylas/layout-layouts'

// 简单的错误边界组件
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[App] Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: {
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif'
        }
      }, [
        React.createElement('h1', { key: 'title', style: { color: '#e74c3c' } }, '应用加载失败'),
        React.createElement('p', { key: 'message', style: { color: '#666', marginTop: '1rem' } }, 
          this.state.error?.message || '未知错误'
        ),
        React.createElement('button', {
          key: 'retry',
          onClick: () => {
            this.setState({ hasError: false, error: null })
            window.location.reload()
          },
          style: {
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#646cff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }
        }, '重新加载')
      ])
    }

    return this.props.children
  }
}

function App() {
  try {
    // 获取布局模块
    const layoutModules = getLayoutModules()
    
    // 获取路由配置（传入布局模块以启用布局功能）
    const { router } = createRouter({
      layoutModules,
    })
    
    return React.createElement(RouterProvider, { router })
  } catch (error) {
    console.error('[App] Failed to create router:', error)
    return React.createElement('div', {
      style: {
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif'
      }
    }, [
      React.createElement('h1', { key: 'title', style: { color: '#e74c3c' } }, '路由初始化失败'),
      React.createElement('p', { key: 'message', style: { color: '#666', marginTop: '1rem' } }, 
        error?.message || '未知错误'
      )
    ])
  }
}

// 使用错误边界包装 App
function AppWithErrorBoundary() {
  return React.createElement(AppErrorBoundary, null, React.createElement(App))
}

export default AppWithErrorBoundary
`

      // 生成 main.tsx 代码（使用 React.createElement 避免 JSX 解析问题）
      const appElement = strictMode 
        ? 'React.createElement(React.StrictMode, null, React.createElement(App))'
        : 'React.createElement(App)'
      
      mainCode = `// 自动生成的应用入口
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from 'virtual:@sylas/layout-app'
import '/index.css'

const rootElement = document.getElementById('${rootId}')
if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(${appElement})
`
    } catch (error) {
      console.error('[layout-vite-react-compiler] Failed to generate code:', error)
      appCode = 'export default function App() { return null }'
      mainCode = 'console.error("Failed to generate main.tsx")'
      layoutsCode = 'export function getLayoutModules() { return {} }'
    }
  }

  // 立即生成一次
  generateCode()

  return {
    name: '@sylas/layout-vite-react-compiler',
    enforce: 'pre',
    resolveId(id) {
      if (id === VIRTUAL_APP_MODULE_ID || id === 'virtual:@sylas/layout-app') {
        return RESOLVED_APP_MODULE_ID
      }
      if (id === VIRTUAL_MAIN_MODULE_ID || id === 'virtual:@sylas/layout-main') {
        return RESOLVED_MAIN_MODULE_ID
      }
      if (id === VIRTUAL_LAYOUTS_MODULE_ID || id === 'virtual:@sylas/layout-layouts') {
        return RESOLVED_LAYOUTS_MODULE_ID
      }
      return null
    },
    load(id) {
      if (id === RESOLVED_APP_MODULE_ID) {
        return appCode
      }
      if (id === RESOLVED_MAIN_MODULE_ID) {
        return mainCode
      }
      if (id === RESOLVED_LAYOUTS_MODULE_ID) {
        return layoutsCode
      }
      return null
    },
    transform(code, id) {
      // 确保虚拟模块被正确识别为需要 JSX 转换
      if (id === RESOLVED_APP_MODULE_ID || id === RESOLVED_MAIN_MODULE_ID) {
        // 返回 null 让其他插件（如 @vitejs/plugin-react）处理 JSX
        return null
      }
      return null
    },
    configResolved() {
      generateCode()
    },
    buildStart() {
      generateCode()
    },
    handleHotUpdate({ file, server }) {
      const normalizedFile = file.replace(/\\/g, '/')
      
      // 检查是否是布局文件
      const isLayoutFile = layoutPatterns.some((pattern) => {
        let testPattern = pattern
        if (testPattern.startsWith('./')) {
          testPattern = testPattern.slice(2)
        }
        let regexStr = testPattern
          .replace(/\*\*/g, '.*')
          .replace(/\*/g, '[^/]*')
          .replace(/\{([^}]+)\}/g, (_, exts) => {
            return `(${exts.split(',').join('|')})`
          })
          .replace(/\./g, '\\.')
        regexStr = '.*' + regexStr + '$'
        const regex = new RegExp(regexStr, 'i')
        return regex.test(normalizedFile)
      })

      if (isLayoutFile) {
        console.log('[layout-vite-react-compiler] Layout file changed, regenerating:', file)
        generateCode()
        // 更新所有相关虚拟模块
        const modules = [
          server.moduleGraph.getModuleById(RESOLVED_APP_MODULE_ID),
          server.moduleGraph.getModuleById(RESOLVED_LAYOUTS_MODULE_ID),
        ].filter(Boolean)
        modules.forEach((module) => {
          if (module) {
            server.moduleGraph.invalidateModule(module)
          }
        })
        return modules
      }
      return undefined
    },
  }
}

