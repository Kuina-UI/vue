import { addComponent, addImports, addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import tailwindcss from '@tailwindcss/vite'
import * as kuinaLibrary from './index'

export default defineNuxtModule({
  meta: {
    name: '@kuina-ui/vue',
    configKey: 'kuina',
    compatibility: { nuxt: '>=4.0.0' },
  },
  setup() {
    addVitePlugin(tailwindcss())

    const kuinaComponentNames = Object.keys(kuinaLibrary).filter((exportName) => exportName.startsWith('K'))

    for (const kuinaComponentName of kuinaComponentNames) {
      addComponent({ name: kuinaComponentName, export: kuinaComponentName, filePath: '@kuina-ui/vue' })
    }

    const kuinaComposableNames = Object.keys(kuinaLibrary).filter((exportName) => exportName.startsWith('use'))

    addImports(kuinaComposableNames.map((kuinaComposableName) => ({ name: kuinaComposableName, from: '@kuina-ui/vue' })))
  },
})
