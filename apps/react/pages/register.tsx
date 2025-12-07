import { definePageMeta } from 'sylas/route-react'
import { Link } from 'react-router-dom'

// 指定使用 auth 布局
definePageMeta({
  layout: 'auth',
  title: '注册',
})

/**
 * 注册页面
 * 使用 auth 布局（居中卡片布局）
 */
export default function RegisterPage() {
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          alert('注册功能演示')
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
            邮箱
          </label>
          <input
            type="email"
            placeholder="请输入邮箱"
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
          注册
        </button>

        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
          已有账号？{' '}
          <Link to="/login" style={{ color: '#646cff', textDecoration: 'none' }}>
            立即登录
          </Link>
        </div>
      </form>
    </div>
  )
}

