import { useState } from 'react'

function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="home-container">
      <h1>欢迎来到 Sylas Template</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          计数是 {count}
        </button>
        <p>
          编辑 <code>src/pages/Home.tsx</code> 来修改这个页面
        </p>
      </div>
      <p className="read-the-docs">
        点击上面的按钮来测试 React Hooks
      </p>
    </div>
  )
}

export default Home

