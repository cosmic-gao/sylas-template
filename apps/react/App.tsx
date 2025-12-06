import { FileRouter } from '@sylas/route-react'
import type { ComponentType } from 'react'

const pageModules = {
  ...import.meta.glob<{ default: ComponentType }>('./pages/**/*.{tsx,jsx}'),
  ...import.meta.glob<{ default: ComponentType }>('./app-pages/**/*.{tsx,jsx}'),
}

function App() {
  return (
    <FileRouter
      modules={pageModules}
      options={{
        pageRoots: ['pages', 'app-pages'],
        defaultTitle: 'Sylas Template',
      }}
    />
  )
}

export default App

