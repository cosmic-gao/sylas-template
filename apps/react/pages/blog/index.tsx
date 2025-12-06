import { definePageMeta } from '@sylas/route-react'

export const pageMeta = definePageMeta({
  name: 'blog-list',
  title: '博客列表 | Sylas Template',
})

function BlogIndex() {
  return (
    <main>
      <h1>博客列表（静态示例）</h1>
      <p>文件：pages/blog/index.tsx，对应路径 /blog</p>
    </main>
  )
}

export default BlogIndex

