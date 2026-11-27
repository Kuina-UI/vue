import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref, type App } from 'vue'
import { KRangeSlider, type RangeSliderProps, type SliderRange } from '.'

const mountedApps: App[] = []

class SilentResizeObserver {
  observe() {}
  disconnect() {}
}

function mountRangeSlider(rangeSliderProps: Partial<RangeSliderProps> = {}, initialRange: SliderRange = [500, 2000]) {
  const sliderRange = ref<SliderRange | undefined>(initialRange)
  const appRoot = document.createElement('div')
  document.body.append(appRoot)

  const app = createApp({
    render: () =>
      h(KRangeSlider, {
        'label': 'Transaction amount',
        'min': 0,
        'max': 5000,
        'step': 50,
        'prefixUnit': '$',
        ...rangeSliderProps,
        'modelValue': sliderRange.value,
        'onUpdate:modelValue': (nextRange: SliderRange | undefined) => {
          sliderRange.value = nextRange
        },
      }),
  })
  app.mount(appRoot)
  mountedApps.push(app)

  const findValueInputs = () => [...appRoot.querySelectorAll<HTMLInputElement>('input[type="text"]')]

  return {
    appRoot,
    sliderRange,
    findGroup: () => appRoot.querySelector<HTMLElement>('[role="group"]')!,
    findLabel: () => appRoot.querySelector<HTMLLabelElement>('label')!,
    findStartInput: () => findValueInputs()[0]!,
    findEndInput: () => findValueInputs()[1]!,
    findThumbs: () => [...appRoot.querySelectorAll<HTMLElement>('[role="slider"]')],
    findResetButton: () => appRoot.querySelector<HTMLButtonElement>('button[aria-label="Reset to default"]'),
  }
}

function typeValue(valueInput: HTMLInputElement, typedText: string) {
  valueInput.value = typedText
  valueInput.dispatchEvent(new Event('input', { bubbles: true }))
}

function pressKey(keyTarget: HTMLElement, key: string) {
  keyTarget.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', SilentResizeObserver)
})

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('KRangeSlider', () => {
  it('groups both ends under its label and names each of them', () => {
    const { findGroup, findLabel, findStartInput, findEndInput, findThumbs } = mountRangeSlider()

    expect(findGroup().getAttribute('aria-labelledby')).toBe(findLabel().id)
    expect(findLabel().htmlFor).toBe(findStartInput().id)
    expect(findStartInput().getAttribute('aria-label')).toBe('Minimum')
    expect(findEndInput().getAttribute('aria-label')).toBe('Maximum')
    expect(findThumbs().map((thumb) => thumb.getAttribute('aria-label'))).toEqual(['Minimum', 'Maximum'])
  })

  it('translates the names of the ends', () => {
    const { findStartInput, findThumbs } = mountRangeSlider({ startLabel: 'Montant minimum', endLabel: 'Montant maximum' })

    expect(findStartInput().getAttribute('aria-label')).toBe('Montant minimum')
    expect(findThumbs()[1]!.getAttribute('aria-label')).toBe('Montant maximum')
  })

  it('shows both values between their units, with a dash', () => {
    const { appRoot, findStartInput, findEndInput } = mountRangeSlider()

    expect(findStartInput().value).toBe('500')
    expect(findEndInput().value).toBe('2000')
    expect(appRoot.querySelector('[class~="group/slider"] > div > div')!.textContent!.replace(/\s+/g, '')).toBe(
      '$–$',
    )
  })

  it('keeps a typed start below the end, minRange apart', async () => {
    const { sliderRange, findStartInput } = mountRangeSlider({ minRange: 100 })

    findStartInput().focus()
    typeValue(findStartInput(), '4000')
    findStartInput().blur()
    await nextTick()

    expect(sliderRange.value).toEqual([1900, 2000])
    expect(findStartInput().value).toBe('1900')
  })

  it('keeps a typed end above the start', async () => {
    const { sliderRange, findEndInput } = mountRangeSlider()

    findEndInput().focus()
    typeValue(findEndInput(), '100')
    findEndInput().blur()
    await nextTick()

    expect(sliderRange.value).toEqual([500, 500])
  })

  it('moves each end from its field with the keyboard', async () => {
    const { sliderRange, findStartInput, findEndInput } = mountRangeSlider()

    findEndInput().focus()
    pressKey(findEndInput(), 'ArrowUp')
    await nextTick()
    expect(sliderRange.value).toEqual([500, 2050])

    findStartInput().focus()
    pressKey(findStartInput(), 'End')
    await nextTick()
    expect(sliderRange.value).toEqual([2050, 2050])
  })

  it('resets both ends from the reset button, hidden while the range is the default one', async () => {
    const { sliderRange, findResetButton } = mountRangeSlider({ resetValue: [0, 5000] })
    const resetWrapper = () => findResetButton()!.parentElement!

    expect(resetWrapper().className).toContain('group-hover/slider:visible')

    findResetButton()!.click()
    await nextTick()

    expect(sliderRange.value).toEqual([0, 5000])
    expect(resetWrapper().className).not.toContain('group-hover/slider:visible')
  })

  it('covers the whole range without a value', () => {
    const appRoot = document.createElement('div')
    document.body.append(appRoot)
    const app = createApp({ render: () => h(KRangeSlider, { label: 'Transaction amount', max: 5000, step: 50 }) })
    app.mount(appRoot)
    mountedApps.push(app)

    expect([...appRoot.querySelectorAll<HTMLInputElement>('input[type="text"]')].map((input) => input.value)).toEqual([
      '0',
      '5000',
    ])
  })

  it('brings both ends back into the range when min or max change', async () => {
    const sliderMax = ref(5000)
    const sliderRange = ref<SliderRange | undefined>([500, 4000])
    const appRoot = document.createElement('div')
    document.body.append(appRoot)
    const app = createApp({
      render: () =>
        h(KRangeSlider, {
          'label': 'Transaction amount',
          'max': sliderMax.value,
          'step': 50,
          'modelValue': sliderRange.value,
          'onUpdate:modelValue': (nextRange: SliderRange | undefined) => {
            sliderRange.value = nextRange
          },
        }),
    })
    app.mount(appRoot)
    mountedApps.push(app)

    sliderMax.value = 3000
    await nextTick()

    expect(sliderRange.value).toEqual([500, 3000])
  })
})
