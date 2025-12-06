// 方式1：使用编译器自动生成的路由（推荐）
import { createRouter } from 'virtual:@sylas/route-routes'
import { RouterProvider } from 'react-router-dom'

function App() {
  const { router } = createRouter()
  return <RouterProvider router={router} />
}

export default App