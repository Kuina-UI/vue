import { Search } from 'lucide-vue-next'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref, type App } from 'vue'
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

  describe('mask', () => {
    function mountMaskedTextField(textFieldProps: Record<string, unknown>) {
      const fieldValue = ref(textFieldProps.modelValue as string | undefined)
      const unmaskedFieldValue = ref(textFieldProps.unmasked as string | undefined)
      const appRoot = document.createElement('div')
      document.body.append(appRoot)

      const app = createApp({
        render: () =>
          h(KTextField, {
            'label': 'Card number',
            ...textFieldProps,
            'modelValue': fieldValue.value,
            'onUpdate:modelValue': (nextValue: string | undefined) => {
              fieldValue.value = nextValue
            },
            'unmasked': unmaskedFieldValue.value,
            'onUpdate:unmasked': (nextValue: string | undefined) => {
              unmaskedFieldValue.value = nextValue
            },
          }),
      })
      app.mount(appRoot)
      mountedApps.push(app)

      const fieldInput = appRoot.querySelector('input') as HTMLInputElement

      return { fieldValue, unmaskedFieldValue, fieldInput }
    }

    it('masks what is typed and fills both models', async () => {
      const { fieldValue, unmaskedFieldValue, fieldInput } = mountMaskedTextField({ mask: '#### #### #### ####' })

      fieldInput.focus()
      fieldInput.value = '4970123412341234'
      fieldInput.dispatchEvent(new InputEvent('input', { inputType: 'insertFromPaste', bubbles: true }))
      await nextTick()

      expect(fieldInput.value).toBe('4970 1234 1234 1234')
      expect(fieldValue.value).toBe('4970 1234 1234 1234')
      expect(unmaskedFieldValue.value).toBe('4970123412341234')
    })

    it('shows a value given through either model with the mask', async () => {
      expect(mountMaskedTextField({ mask: '##:##', modelValue: '0930' }).fieldInput.value).toBe('09:30')
      expect(mountMaskedTextField({ mask: '+261 ## ## ### ##', unmasked: '341234567' }).fieldInput.value).toBe(
        '+261 34 12 345 67',
      )

      const { fieldValue, fieldInput } = mountMaskedTextField({ mask: '##:##' })
      fieldValue.value = '1845'
      await nextTick()
      await nextTick()

      expect(fieldInput.value).toBe('18:45')
    })
  })
})
