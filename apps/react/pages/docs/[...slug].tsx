import { useParams } from 'react-router-dom'
import { definePageMeta } from 'sylas/route-react'

export const pageMeta = definePageMeta({
  name: 'docs-slug',
  title: '文档 | Sylas Template',
})

function DocsCatchAll() {
  const params = useParams()
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug

  return (
    <main>
      <h1>文档（catch-all 示例）</h1>
      <p>文件：pages/docs/[...slug].tsx，对应路径 /docs/:slug*</p>
      <p>当前 slug：{slug}</p>
    </main>
  )
}

export default DocsCatchAll

