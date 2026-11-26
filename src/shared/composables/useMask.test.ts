import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, type App } from 'vue'
import type { MaskOptions } from '../types/mask'
import { useMask } from './useMask'

const mountedApps: App[] = []

function mountMaskedInput(maskOptions: MaskOptions, initialText = '') {
  let maskControls!: ReturnType<typeof useMask>
  const appRoot = document.createElement('div')
  document.body.append(appRoot)

  const app = createApp({
    setup() {
      maskControls = useMask(maskOptions, initialText)
      return () => h('input', { value: maskControls.maskedValue.value, onInput: maskControls.applyMaskOnInput })
    },
  })
  app.mount(appRoot)
  mountedApps.push(app)

  const maskedInput = appRoot.querySelector('input') as HTMLInputElement
  maskedInput.focus()

  async function typeText(rawText: string, inputType = 'insertText', caretPosition = rawText.length) {
    maskedInput.value = rawText
    maskedInput.setSelectionRange(caretPosition, caretPosition)
    maskedInput.dispatchEvent(new InputEvent('input', { inputType, bubbles: true }))
    await nextTick()
  }

  return { maskedInput, typeText, maskControls: () => maskControls }
}

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
})

describe('useMask', () => {
  it('masks what is typed and gives the unmasked value', async () => {
    const { maskedInput, typeText, maskControls } = mountMaskedInput('#### #### #### ####')

    await typeText('49701234')

    expect(maskedInput.value).toBe('4970 1234 ')
    expect(maskControls().unmaskedValue.value).toBe('49701234')
    expect(maskControls().isComplete.value).toBe(false)
  })

  it('removes a trailing separator with Backspace', async () => {
    const { maskedInput, typeText } = mountMaskedInput('##/##/####')

    await typeText('11')
    await typeText('11', 'deleteContentBackward')

    expect(maskedInput.value).toBe('11')
  })

  it('removes the character before a separator when Backspace only hits the separator', async () => {
    const { maskedInput, typeText } = mountMaskedInput('##/##/####', '11022026')

    await typeText('1102/2026', 'deleteContentBackward', 2)

    expect(maskedInput.value).toBe('10/22/026')
    expect(maskedInput.selectionStart).toBe(1)
  })

  it('keeps the caret after the same characters when editing in the middle', async () => {
    const { maskedInput, typeText } = mountMaskedInput('##/##/####', '11022026')

    await typeText('113/02/2026', 'insertText', 3)

    expect(maskedInput.value).toBe('11/30/2202')
    expect(maskedInput.selectionStart).toBe(4)
  })

  it('applies preprocess to pasted text', async () => {
    const { maskedInput, typeText } = mountMaskedInput({
      pattern: '##/##/####',
      preprocess: (text) => text.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$2$3$1'),
    })

    await typeText('2026-11-02', 'insertFromPaste')

    expect(maskedInput.value).toBe('11/02/2026')
  })

  it('masks a value set from code', async () => {
    const { maskedInput, maskControls } = mountMaskedInput('##:##')

    maskControls().setMaskedValue('0930')
    await nextTick()

    expect(maskedInput.value).toBe('09:30')
    expect(maskControls().isComplete.value).toBe(true)
  })
})
