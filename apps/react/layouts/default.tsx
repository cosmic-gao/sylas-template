import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

/**
 * 默认布局 - 基础布局
 * 包含导航栏和页脚
 */
export default function DefaultLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 导航栏 */}
      <header
        style={{
          background: '#1a1a1a',
          padding: '1rem 2rem',
          borderBottom: '1px solid #333',
        }}
      >
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#646cff', textDecoration: 'none', fontWeight: 'bold' }}>
            Sylas Template
          </Link>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>
            首页
          </Link>
          <Link to="/about" style={{ color: '#fff', textDecoration: 'none' }}>
            关于
          </Link>
          <Link to="/blog" style={{ color: '#fff', textDecoration: 'none' }}>
            博客
          </Link>
          <Link to="/admin" style={{ color: '#fff', textDecoration: 'none' }}>
            管理后台
          </Link>
        </nav>
      </header>

      {/* 页面内容 */}
      <main style={{ flex: 1, padding: '2rem' }}>{children}</main>

      {/* 页脚 */}
      <footer
        style={{
          background: '#1a1a1a',
          padding: '1rem 2rem',
          borderTop: '1px solid #333',
          textAlign: 'center',
          color: '#888',
        }}
      >
        <p>© 2024 Sylas Template. 使用默认布局</p>
      </footer>
    </div>
  )
}

