import { definePageMeta } from 'sylas/route-react'
import { Link } from 'react-router-dom'

// 指定使用 auth 布局
definePageMeta({
  layout: 'auth',
  title: '登录',
})

/**
 * 登录页面
 * 使用 auth 布局（居中卡片布局）
 */
export default function LoginPage() {
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          alert('登录功能演示')
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500',
            }}
          >
            用户名
          </label>
          <input
            type="text"
            placeholder="请输入用户名"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500',
            }}
          >
            密码
          </label>
          <input
            type="password"
            placeholder="请输入密码"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#646cff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          登录
        </button>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
          <Link to="/" style={{ color: '#646cff', textDecoration: 'none' }}>
            返回首页
          </Link>
        </div>
      </form>
    </div>
  )
}

