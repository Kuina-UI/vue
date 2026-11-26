import { Search } from 'lucide-vue-next'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, type App } from 'vue'
import { KTextField } from '.'

const mountedApps: App[] = []

function mountTextField(textFieldProps: Record<string, unknown> = {}) {
  const appRoot = document.createElement('div')
  document.body.append(appRoot)

  const app = createApp({ render: () => h(KTextField, { label: 'Search transactions', ...textFieldProps }) })
  app.mount(appRoot)
  mountedApps.push(app)

  return {
    findInput: () => appRoot.querySelector('input'),
    findLabel: () => appRoot.querySelector('label'),
  }
}

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
})

describe('KTextField', () => {
  it('rests the label inside the empty field and keeps the placeholder hidden', () => {
    const { findInput, findLabel } = mountTextField({ placeholder: 'Merchant or amount', leadingIcon: Search })

    expect(findLabel()?.className).toContain('peer-placeholder-shown:top-1/2')
    expect(findInput()?.getAttribute('placeholder')).toBe(' ')
  })

  it('keeps the label up and shows the placeholder when the label always floats', () => {
    const { findInput, findLabel } = mountTextField({
      placeholder: 'Merchant or amount',
      leadingIcon: Search,
      floatLabel: 'always',
    })

    expect(findLabel()?.className).toContain('top-0')
    expect(findLabel()?.className).toContain('text-xs')
    expect(findLabel()?.className).not.toContain('peer-placeholder-shown')
    expect(findInput()?.getAttribute('placeholder')).toBe('Merchant or amount')
  })
})
