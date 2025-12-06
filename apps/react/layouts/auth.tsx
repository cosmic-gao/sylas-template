import type { ReactNode } from 'react'

/**
 * 认证页面布局 - 居中卡片布局
 * 用于登录、注册等认证相关页面
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '3rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, color: '#333' }}>🔐 认证</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#666' }}>使用 Auth 布局</p>
        </div>
        {children}
      </div>
    </div>
  )
}

