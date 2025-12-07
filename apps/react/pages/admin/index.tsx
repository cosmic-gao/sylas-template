import { definePageMeta } from 'sylas/route-react'

// 指定使用 admin 布局
definePageMeta({
  layout: 'admin',
  title: '管理后台 - 仪表盘',
})

/**
 * 管理后台首页
 * 使用 admin 布局（侧边栏布局）
 */
export default function AdminDashboard() {
  return (
    <div>
      <h1>管理后台仪表盘</h1>
      <p>这是管理后台的首页，使用了 <code>admin</code> 布局。</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>功能模块</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1.5rem', background: '#f0f0ff', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 0.5rem' }}>📊 数据统计</h3>
            <p style={{ margin: 0, color: '#666' }}>查看系统数据统计</p>
          </div>
          <div style={{ padding: '1.5rem', background: '#fff0f0', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 0.5rem' }}>👥 用户管理</h3>
            <p style={{ margin: 0, color: '#666' }}>管理用户信息</p>
          </div>
          <div style={{ padding: '1.5rem', background: '#f0fff0', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 0.5rem' }}>⚙️ 系统设置</h3>
            <p style={{ margin: 0, color: '#666' }}>配置系统参数</p>
          </div>
        </div>
      </div>
    </div>
  )
}

