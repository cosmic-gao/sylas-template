export default {
  title: 'Sylas Template',
  html: {
    lang: 'zh-CN',
  },
  css: {
    // 指向当前 React 应用的全局样式
    path: './index.css',
  },
  router: {
    kebabKeepDigits: true,
    // pages 目录根（相对 apps/react）
    pageRoots: ['pages', 'app-pages'],
  },
  layout: {
    patterns: ['./layouts/**/*.{tsx,jsx}'],
    rootId: 'root',
    strictMode: true,
  },
}

