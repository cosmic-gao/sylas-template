import { Link } from 'react-router-dom'

function IndexPage() {
  return (
    <main style={{ padding: 24, lineHeight: 1.6 }}>
      <h1>路由规则演示（Nuxt3 风格）</h1>
      <p>选择下列示例查看对应路径与页面：</p>
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
    </main>
  )
}

export default IndexPage

