import { useParams } from 'react-router-dom'
import { definePageMeta } from 'sylas/route-react'

export const pageMeta = definePageMeta({
  name: 'blog-id',
  title: '博客详情 | Sylas Template',
})

function BlogDetail() {
  const params = useParams()
  return (
    <main>
      <h1>博客详情（动态段示例）</h1>
      <p>文件：pages/blog/[id].tsx，对应路径 /blog/:id</p>
      <p>当前 id：{params.id}</p>
    </main>
  )
}

export default BlogDetail

