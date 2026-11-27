import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref, type App } from 'vue'
import { KSlider, type SliderProps } from '.'

const mountedApps: App[] = []

class SilentResizeObserver {
  observe() {}
  disconnect() {}
}

function mountSlider(sliderProps: Partial<SliderProps> = {}, initialValue = 1000) {
  const sliderValue = ref<number | undefined>(initialValue)
  const sliderFocusListener = vi.fn()
  const sliderBlurListener = vi.fn()
  const appRoot = document.createElement('div')
  document.body.append(appRoot)

  const app = createApp({
    render: () =>
      h(KSlider, {
        'label': 'Request timeout',
        'min': 0,
        'max': 2000,
        'step': 10,
        'unit': 'ms',
        ...sliderProps,
        'modelValue': sliderValue.value,
        'onUpdate:modelValue': (nextValue: number | undefined) => {
          sliderValue.value = nextValue
        },
        'onFocus': sliderFocusListener,
        'onBlur': sliderBlurListener,
      }),
  })
  app.mount(appRoot)
  mountedApps.push(app)

  return {
    appRoot,
    sliderValue,
    sliderFocusListener,
    sliderBlurListener,
    findLabel: () => appRoot.querySelector<HTMLLabelElement>('label')!,
    findValueInput: () => appRoot.querySelector<HTMLInputElement>('input[type="text"]')!,
    findThumb: () => appRoot.querySelector<HTMLElement>('[role="slider"]')!,
    findResetButton: () => appRoot.querySelector<HTMLButtonElement>('button[aria-label="Reset to default"]'),
  }
}

function typeValue(valueInput: HTMLInputElement, typedText: string) {
  valueInput.value = typedText
  valueInput.dispatchEvent(new Event('input', { bubbles: true }))
}

function pressKey(keyTarget: HTMLElement, key: string, keyOptions: KeyboardEventInit = {}) {
  keyTarget.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...keyOptions }))
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', SilentResizeObserver)
})

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('KSlider', () => {
  it('labels both the value field and the thumb', () => {
    const { findLabel, findValueInput, findThumb } = mountSlider()

    expect(findLabel().textContent?.trim()).toBe('Request timeout')
    expect(findLabel().htmlFor).toBe(findValueInput().id)
    expect(findThumb().getAttribute('aria-labelledby')).toBe(findLabel().id)
  })

  it('shows the value with as many decimals as the step, between its units', () => {
    const { appRoot, findValueInput } = mountSlider({ step: 0.25, unit: '%', prefixUnit: '$' }, 12.5)

    expect(findValueInput().value).toBe('12.50')
    expect(appRoot.textContent).toContain('$')
    expect(appRoot.textContent).toContain('%')
  })

  it('gives the value field its character count, for browsers that cannot size it to its content', () => {
    const { findValueInput } = mountSlider({}, 1000000000)

    expect(findValueInput().style.getPropertyValue('--slider-value-length')).toBe('10')
    expect(findValueInput().className).toContain('field-sizing-content')
  })

  it('selects the whole value on focus', async () => {
    const { findValueInput, sliderFocusListener } = mountSlider()

    findValueInput().focus()
    await nextTick()

    expect(findValueInput().selectionStart).toBe(0)
    expect(findValueInput().selectionEnd).toBe(4)
    expect(sliderFocusListener).toHaveBeenCalledOnce()
  })

  it('updates the value 250ms after the typing stops, without rewriting the typed text', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const { sliderValue, findValueInput } = mountSlider()

    findValueInput().focus()
    typeValue(findValueInput(), '15')
    vi.advanceTimersByTime(200)
    typeValue(findValueInput(), '1505')
    vi.advanceTimersByTime(249)
    expect(sliderValue.value).toBe(1000)

    vi.advanceTimersByTime(1)
    await nextTick()

    expect(sliderValue.value).toBe(1505)
    expect(findValueInput().value).toBe('1505')
  })

  it('keeps only digits and the decimal point while typing', () => {
    const { findValueInput } = mountSlider()

    findValueInput().focus()
    typeValue(findValueInput(), '1a2b')

    expect(findValueInput().value).toBe('12')
  })

  it('accepts a minus sign when the range goes below zero', () => {
    const { findValueInput } = mountSlider({ min: -100, max: 100, step: 1 }, 0)

    findValueInput().focus()
    typeValue(findValueInput(), '-40')

    expect(findValueInput().value).toBe('-40')
  })

  it('commits the typed value on blur, kept in range and rounded to the step precision', async () => {
    const { sliderValue, findValueInput, sliderBlurListener } = mountSlider({ step: 0.1, max: 20 }, 10)

    findValueInput().focus()
    typeValue(findValueInput(), '12.345')
    findValueInput().blur()
    await nextTick()

    expect(sliderValue.value).toBe(12.3)
    expect(findValueInput().value).toBe('12.3')
    expect(sliderBlurListener).toHaveBeenCalledOnce()

    findValueInput().focus()
    typeValue(findValueInput(), '99')
    findValueInput().blur()
    await nextTick()

    expect(sliderValue.value).toBe(20)
    expect(findValueInput().value).toBe('20.0')
  })

  it('drops whole steps below 1 when the step is whole', async () => {
    const { sliderValue, findValueInput } = mountSlider()

    findValueInput().focus()
    typeValue(findValueInput(), '1234.9')
    findValueInput().blur()
    await nextTick()

    expect(sliderValue.value).toBe(1234)
  })

  it('changes the value from the field with the arrows, Home and End', async () => {
    const { sliderValue, findValueInput } = mountSlider()

    findValueInput().focus()
    pressKey(findValueInput(), 'ArrowUp')
    await nextTick()
    expect(sliderValue.value).toBe(1010)
    expect(findValueInput().value).toBe('1010')

    pressKey(findValueInput(), 'ArrowDown', { shiftKey: true })
    await nextTick()
    expect(sliderValue.value).toBe(910)

    pressKey(findValueInput(), 'End')
    await nextTick()
    expect(sliderValue.value).toBe(2000)

    pressKey(findValueInput(), 'Home')
    await nextTick()
    expect(sliderValue.value).toBe(0)
  })

  it('leaves the field with Enter or Escape', async () => {
    const { findValueInput } = mountSlider()

    findValueInput().focus()
    pressKey(findValueInput(), 'Enter')
    expect(document.activeElement).not.toBe(findValueInput())

    findValueInput().focus()
    pressKey(findValueInput(), 'Escape')
    expect(document.activeElement).not.toBe(findValueInput())
  })

  it('shows outside values in the field only while it is not focused', async () => {
    const { sliderValue, findValueInput } = mountSlider()

    sliderValue.value = 1500
    await nextTick()
    expect(findValueInput().value).toBe('1500')

    findValueInput().focus()
    typeValue(findValueInput(), '17')
    sliderValue.value = 1800
    await nextTick()
    expect(findValueInput().value).toBe('17')
  })

  it('brings the value back into the range when min or max change', async () => {
    const sliderMax = ref(2000)
    const sliderValue = ref<number | undefined>(1500)
    const appRoot = document.createElement('div')
    document.body.append(appRoot)
    const app = createApp({
      render: () =>
        h(KSlider, {
          'label': 'Request timeout',
          'max': sliderMax.value,
          'step': 10,
          'modelValue': sliderValue.value,
          'onUpdate:modelValue': (nextValue: number | undefined) => {
            sliderValue.value = nextValue
          },
        }),
    })
    app.mount(appRoot)
    mountedApps.push(app)

    sliderMax.value = 1000
    await nextTick()
    await nextTick()

    expect(sliderValue.value).toBe(1000)
    expect(appRoot.querySelector<HTMLInputElement>('input[type="text"]')!.value).toBe('1000')
  })

  it('resets to the default value from a button that is hidden while the value is the default', async () => {
    const { sliderValue, findResetButton } = mountSlider({ resetValue: 1000 }, 1250)
    const resetWrapper = () => findResetButton()!.parentElement!

    expect(resetWrapper().className).toContain('group-hover/slider:visible')

    findResetButton()!.click()
    await nextTick()

    expect(sliderValue.value).toBe(1000)
    expect(resetWrapper().className).not.toContain('group-hover/slider:visible')
    expect(findResetButton()!.className).toContain('cursor-default')
  })

  it('keeps the reset button revealable while the thumb is pressed, even on the default value', async () => {
    vi.spyOn(HTMLElement.prototype, 'setPointerCapture').mockImplementation(() => {})
    vi.spyOn(HTMLElement.prototype, 'hasPointerCapture').mockReturnValue(false)
    const { findResetButton, findThumb } = mountSlider({ resetValue: 1000 }, 1000)
    const resetWrapper = () => findResetButton()!.parentElement!

    expect(resetWrapper().className).not.toContain('group-hover/slider:visible')

    findThumb().dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1, button: 0, bubbles: true, cancelable: true }))
    await nextTick()
    expect(resetWrapper().className).toContain('group-hover/slider:visible')

    findThumb().dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, button: 0, bubbles: true }))
    await nextTick()
    expect(resetWrapper().className).not.toContain('group-hover/slider:visible')
  })

  it('never reveals the reset button when disabled', () => {
    const { findResetButton, findValueInput } = mountSlider({ resetValue: 1000, disabled: true }, 1250)

    expect(findResetButton()!.parentElement!.className).not.toContain('group-hover/slider:visible')
    expect(findValueInput().disabled).toBe(true)
  })

  it('starts at min without a value, then keeps its own value', async () => {
    const appRoot = document.createElement('div')
    document.body.append(appRoot)
    const app = createApp({ render: () => h(KSlider, { label: 'Request timeout', min: 100, max: 2000, step: 10 }) })
    app.mount(appRoot)
    mountedApps.push(app)
    const valueInput = appRoot.querySelector<HTMLInputElement>('input[type="text"]')!

    expect(valueInput.value).toBe('100')

    pressKey(valueInput, 'End')
    await nextTick()

    expect(valueInput.value).toBe('2000')
    expect(appRoot.querySelector('[role="slider"]')!.getAttribute('aria-valuenow')).toBe('2000')
  })
})
