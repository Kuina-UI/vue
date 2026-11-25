import { addComponent, addImports, addVitePlugin } from '@nuxt/kit'
import { describe, expect, it, vi } from 'vitest'
import * as kuinaLibrary from './index'
import kuinaNuxtModule from './nuxt'

vi.mock('@nuxt/kit', () => ({
  addComponent: vi.fn(),
  addImports: vi.fn(),
  addVitePlugin: vi.fn(),
  defineNuxtModule: (moduleDefinition: unknown) => moduleDefinition,
}))

vi.mock('@tailwindcss/vite', () => ({ default: () => 'tailwind-vite-plugin' }))

function setUpKuinaModule() {
  const moduleDefinition = kuinaNuxtModule as unknown as { setup: () => void }
  moduleDefinition.setup()
}

describe('Kuina Nuxt module', () => {
  it('adds the Tailwind CSS Vite plugin', () => {
    setUpKuinaModule()

    expect(addVitePlugin).toHaveBeenCalledWith('tailwind-vite-plugin')
  })

  it('registers every Kuina component from the package', () => {
    setUpKuinaModule()

    const kuinaComponentNames = Object.keys(kuinaLibrary).filter((exportName) => exportName.startsWith('K'))

    expect(kuinaComponentNames).toContain('KMenu')
    for (const kuinaComponentName of kuinaComponentNames) {
      expect(addComponent).toHaveBeenCalledWith({
        name: kuinaComponentName,
        export: kuinaComponentName,
        filePath: '@kuina-ui/vue',
      })
    }
  })

  it('auto-imports every Kuina composable from the package', () => {
    setUpKuinaModule()

    expect(addImports).toHaveBeenCalledWith([{ name: 'useShortcuts', from: '@kuina-ui/vue' }])
  })
})
