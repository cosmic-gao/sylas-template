import { definePageMeta } from 'sylas/route-react'

export const pageMeta = definePageMeta({
  name: 'about',
  title: '关于我们 | Sylas Template',
})

function AboutIndex() {
  return (
    <main>
      <h1>关于我们（index 折叠示例）</h1>
      <p>文件：pages/about/index.tsx，对应路径 /about</p>
    </main>
  )
}

export default AboutIndex

