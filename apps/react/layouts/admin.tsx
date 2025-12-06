import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

/**
 * 管理后台布局 - 侧边栏布局
 * 这是一个嵌套布局示例，内部使用侧边栏 + 内容区域的结构
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation()

  const menuItems = [
    { path: '/admin', label: '仪表盘', icon: '📊' },
    { path: '/admin/users', label: '用户管理', icon: '👥' },
    { path: '/admin/settings', label: '系统设置', icon: '⚙️' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f5f5' }}>
      {/* 侧边栏 */}
      <aside
        style={{
          width: '250px',
          background: '#fff',
          borderRight: '1px solid #e0e0e0',
          padding: '1.5rem 0',
        }}
      >
        <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, color: '#333' }}>管理后台</h2>
          <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>
            使用 Admin 布局
          </p>
        </div>

        <nav>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'block',
                  padding: '0.75rem 1.5rem',
                  color: isActive ? '#646cff' : '#333',
                  textDecoration: 'none',
                  background: isActive ? '#f0f0ff' : 'transparent',
                  borderLeft: isActive ? '3px solid #646cff' : '3px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* 主内容区域 */}
      <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}

