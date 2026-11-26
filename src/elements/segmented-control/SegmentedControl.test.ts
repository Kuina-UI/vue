import { CalendarDays, LayoutGrid, List } from 'lucide-vue-next'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref, type App } from 'vue'
import { KSegmentedControl, type SegmentedControlOption, type SegmentedControlProps } from '.'

const mountedApps: App[] = []

const measuredOptionWidth = 80
const measuredTrackWidth = 400
const optionGap = 2
const trackPadding = 2

const transactionTypeOptions: SegmentedControlOption[] = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expenses', label: 'Expenses' },
]

function measureOptionOffset(optionElement: HTMLElement) {
  const optionElements = [...(optionElement.parentElement?.querySelectorAll('label') ?? [])]

  return trackPadding + optionElements.indexOf(optionElement as HTMLLabelElement) * (measuredOptionWidth + optionGap)
}

function mountSegmentedControl(segmentedControlProps: Partial<SegmentedControlProps> = {}, initialValue = 'all') {
  const selectedValue = ref<string | undefined>(initialValue)
  const appRoot = document.createElement('div')
  document.body.append(appRoot)

  const app = createApp({
    render: () =>
      h(KSegmentedControl, {
        'ariaLabel': 'Transaction type',
        'options': transactionTypeOptions,
        ...segmentedControlProps,
        'modelValue': selectedValue.value,
        'onUpdate:modelValue': (nextValue: string | undefined) => {
          selectedValue.value = nextValue
        },
      }),
  })
  app.mount(appRoot)
  mountedApps.push(app)

  return {
    selectedValue,
    findTrack: () => appRoot.querySelector<HTMLElement>('[role="radiogroup"]'),
    findThumb: () => appRoot.querySelector<HTMLElement>('[aria-hidden="true"]'),
    findOptions: () => [...appRoot.querySelectorAll<HTMLLabelElement>('label')],
    findRadios: () => [...appRoot.querySelectorAll<HTMLInputElement>('input[type="radio"]')],
  }
}

function waitForAnimationFrames(frameCount: number) {
  return new Promise<void>((resolveFrames) => {
    let remainingFrames = frameCount
    requestAnimationFrame(function countFrame() {
      remainingFrames -= 1
      if (remainingFrames === 0) resolveFrames()
      else requestAnimationFrame(countFrame)
    })
  })
}

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) {
    return this.tagName === 'LABEL' ? measureOptionOffset(this) : 0
  })
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
    return this.tagName === 'LABEL' ? measuredOptionWidth : measuredTrackWidth
  })
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(measuredTrackWidth)
})

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('KSegmentedControl', () => {
  it('renders a named radio group with one radio per option', () => {
    const { findTrack, findRadios } = mountSegmentedControl()

    expect(findTrack()?.getAttribute('aria-label')).toBe('Transaction type')
    expect(findRadios().map((radio) => radio.value)).toEqual(['all', 'income', 'expenses'])
    expect(new Set(findRadios().map((radio) => radio.name)).size).toBe(1)
  })

  it('checks the option of the model value', () => {
    const { findRadios } = mountSegmentedControl({}, 'income')

    expect(findRadios().map((radio) => radio.checked)).toEqual([false, true, false])
  })

  it('updates the model value when another option is chosen', async () => {
    const { selectedValue, findRadios } = mountSegmentedControl()

    findRadios()[2]?.click()
    await nextTick()

    expect(selectedValue.value).toBe('expenses')
  })

  it('uses the name prop for every radio', () => {
    const { findRadios } = mountSegmentedControl({ name: 'transaction-type' })

    expect(findRadios().every((radio) => radio.name === 'transaction-type')).toBe(true)
  })

  describe('icons', () => {
    it('shows the icon before the label', () => {
      const { findOptions } = mountSegmentedControl({
        options: [{ value: 'calendar', label: 'Calendar', icon: CalendarDays }],
      })

      expect(findOptions()[0]?.querySelector('svg')).not.toBeNull()
      expect(findOptions()[0]?.textContent?.trim()).toBe('Calendar')
    })

    it('keeps only the icons of square options and names each radio with its label', () => {
      const { findOptions, findRadios } = mountSegmentedControl(
        {
          square: true,
          options: [
            { value: 'list', label: 'List view', icon: List },
            { value: 'grid', label: 'Grid view', icon: LayoutGrid },
          ],
        },
        'grid',
      )

      expect(findOptions().map((option) => option.textContent?.trim())).toEqual(['', ''])
      expect(findRadios().map((radio) => radio.getAttribute('aria-label'))).toEqual(['List view', 'Grid view'])
    })
  })

  describe('disabled', () => {
    it('disables every radio of a disabled control', () => {
      const { findRadios } = mountSegmentedControl({ disabled: true })

      expect(findRadios().every((radio) => radio.disabled)).toBe(true)
    })

    it('disables only the radio of a disabled option', () => {
      const { findRadios } = mountSegmentedControl({
        options: [
          { value: 'monthly', label: 'Monthly' },
          { value: 'lifetime', label: 'Lifetime', disabled: true },
        ],
      })

      expect(findRadios().map((radio) => radio.disabled)).toEqual([false, true])
    })
  })

  describe('thumb', () => {
    it('shows the selection on the checked option until the thumb is placed', () => {
      const { findThumb } = mountSegmentedControl()

      expect(findThumb()?.className).toContain('invisible')
    })

    it('covers the selected option once placed, without sliding there', async () => {
      const { findThumb } = mountSegmentedControl({}, 'income')

      await nextTick()

      expect(findThumb()?.style.width).toBe(`${measuredOptionWidth}px`)
      expect(findThumb()?.style.transform).toBe(`translateX(${trackPadding + measuredOptionWidth + optionGap}px)`)
      expect(findThumb()?.className).not.toContain('transition-')

      await waitForAnimationFrames(2)
      await nextTick()

      expect(findThumb()?.className).not.toContain('invisible')
    })

    it('slides to the newly selected option', async () => {
      const { selectedValue, findThumb } = mountSegmentedControl()

      await waitForAnimationFrames(2)
      await nextTick()

      selectedValue.value = 'expenses'
      await nextTick()
      await nextTick()

      expect(findThumb()?.className).toContain('transition-[width,transform]')
      expect(findThumb()?.style.transform).toBe(`translateX(${trackPadding + 2 * (measuredOptionWidth + optionGap)}px)`)
    })

    it('stays narrower by one pixel when it would touch the end of the track', async () => {
      vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(
        trackPadding + 3 * measuredOptionWidth + 2 * optionGap + 1,
      )

      const { findThumb } = mountSegmentedControl({}, 'expenses')
      await nextTick()

      expect(findThumb()?.style.width).toBe(`${measuredOptionWidth - 1}px`)
    })

    it('hides when the model value matches no option', async () => {
      const { findThumb } = mountSegmentedControl({}, 'transfers')
      await nextTick()

      expect(findThumb()?.style.display).toBe('none')
    })
  })

  it('shrinks the press highlight less on wider options', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(120)
    const { findOptions } = mountSegmentedControl()

    findOptions()[1]?.dispatchEvent(new PointerEvent('pointerenter'))

    expect(findOptions()[1]?.style.getPropertyValue('--press-scale-x')).toBe('0.97')
  })
})
