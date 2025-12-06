import { definePageMeta } from '@sylas/route-react'

// 指定使用 admin 布局
definePageMeta({
  layout: 'admin',
  title: '系统设置',
})

/**
 * 系统设置页面
 * 使用 admin 布局
 */
export default function AdminSettings() {
  return (
    <div>
      <h1>系统设置</h1>
      <p>配置系统参数，使用 <code>admin</code> 布局。</p>
      
      <div style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            站点名称
          </label>
          <input
            type="text"
            defaultValue="Sylas Template"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            站点描述
          </label>
          <textarea
            defaultValue="一个基于文件路由的 React 模板"
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              fontFamily: 'inherit',
            }}
          />
        </div>
        
        <button
          style={{
            padding: '0.75rem 1.5rem',
            background: '#646cff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          保存设置
        </button>
      </div>
    </div>
  )
}

