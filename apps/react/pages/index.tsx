import { Link } from 'react-router-dom'
import { definePageMeta } from 'sylas/route-react'

// 使用默认布局（可以不指定，默认就是 default）
definePageMeta({
  layout: 'default',
  title: '首页',
})

function IndexPage() {
  return (
    <main style={{ padding: 24, lineHeight: 1.6 }}>
      <h1>路由规则演示（Nuxt3 风格）</h1>
      <p>选择下列示例查看对应路径与页面：</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>📋 路由示例</h2>
        <ul>
          <li>
            <Link to="/about">/about （index 折叠）</Link>
          </li>
          <li>
            <Link to="/blog">/blog （静态）</Link>
          </li>
          <li>
            <Link to="/blog/123">/blog/:id （动态）</Link>
          </li>
          <li>
            <Link to="/docs/guide/getting-started">/docs/:slug* （catch-all）</Link>
          </li>
          <li>
            <Link to="/promo">/promo （分组目录忽略）</Link>
          </li>
          <li>
            <Link to="/user/profile">/user/profile （嵌套静态）</Link>
          </li>
          <li>
            <Link to="/landing">/landing （多 pages 根目录示例）</Link>
          </li>
          <li>
            <Link to="/home">/home （单文件示例）</Link>
          </li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0f0ff', borderRadius: '8px' }}>
        <h2>🎨 布局示例</h2>
        <p>以下页面演示了不同的布局系统：</p>
        <ul>
          <li>
            <strong>默认布局（default）</strong>：当前页面使用，包含导航栏和页脚
          </li>
          <li>
            <Link to="/admin">管理后台布局（admin）</Link>：侧边栏 + 内容区域布局
          </li>
          <li>
            <Link to="/login">认证布局（auth）</Link>：居中卡片布局，用于登录/注册页面
          </li>
          <li>
            <Link to="/register">注册页面</Link>：同样使用 auth 布局
          </li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fff0f0', borderRadius: '8px' }}>
        <h2>💡 布局使用说明</h2>
        <p>在页面文件中使用 <code>definePageMeta</code> 来指定布局：</p>
        <pre style={{ background: '#1a1a1a', color: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`import { definePageMeta } from 'sylas/route-react'

definePageMeta({
  layout: 'admin',  // 指定布局名称
  title: '页面标题',
})

export default function MyPage() {
  return <div>页面内容</div>
}`}
        </pre>
      </div>
    </main>
  )
}

export default IndexPage

