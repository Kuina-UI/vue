import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, type App } from 'vue'
import { KTextarea } from '.'

const mountedApps: App[] = []

function mountTextarea(textareaProps: Record<string, unknown> = {}) {
  const appRoot = document.createElement('div')
  document.body.append(appRoot)

  const app = createApp({ render: () => h(KTextarea, { label: 'Note', ...textareaProps }) })
  app.mount(appRoot)
  mountedApps.push(app)

  return {
    findTextarea: () => appRoot.querySelector('textarea'),
    findLabel: () => appRoot.querySelector('label'),
  }
}

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
})

describe('KTextarea', () => {
  it('rests the label inside the empty field and keeps the placeholder hidden', () => {
    const { findTextarea, findLabel } = mountTextarea({ placeholder: 'Add details for your accountant' })

    expect(findLabel()?.className).toContain('peer-placeholder-shown:top-7')
    expect(findTextarea()?.getAttribute('placeholder')).toBe(' ')
  })

  it('keeps the label up and shows the placeholder when the label always floats', () => {
    const { findTextarea, findLabel } = mountTextarea({
      placeholder: 'Add details for your accountant',
      floatLabel: 'always',
    })

    expect(findLabel()?.className).toContain('top-0')
    expect(findLabel()?.className).toContain('text-xs')
    expect(findLabel()?.className).not.toContain('peer-placeholder-shown')
    expect(findTextarea()?.getAttribute('placeholder')).toBe('Add details for your accountant')
  })
})
