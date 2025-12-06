import { definePageMeta } from '@sylas/route-react'

// 指定使用 admin 布局
definePageMeta({
  layout: 'admin',
  title: '用户管理',
})

/**
 * 用户管理页面
 * 使用 admin 布局
 */
export default function AdminUsers() {
  const users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员' },
    { id: 2, name: '李四', email: 'lisi@example.com', role: '用户' },
    { id: 3, name: '王五', email: 'wangwu@example.com', role: '用户' },
  ]

  return (
    <div>
      <h1>用户管理</h1>
      <p>管理系统的所有用户，使用 <code>admin</code> 布局。</p>
      
      <div style={{ marginTop: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>ID</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>姓名</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>邮箱</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>角色</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>{user.id}</td>
                <td style={{ padding: '0.75rem' }}>{user.name}</td>
                <td style={{ padding: '0.75rem' }}>{user.email}</td>
                <td style={{ padding: '0.75rem' }}>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

