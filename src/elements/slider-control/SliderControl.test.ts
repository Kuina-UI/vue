import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref, type App } from 'vue'
import { KSliderControl, type SliderControlProps } from '.'
import type { SliderMark } from '../../shared/types/slider'

const mountedApps: App[] = []

const measuredControlWidth = 300

let markBoxesByLayout: Record<'inline' | 'wrapped', Array<{ left: number; right: number }>>

class ImmediateResizeObserver {
  constructor(private readonly reportResize: ResizeObserverCallback) {}

  observe(observedElement: Element) {
    const observedWidth = observedElement.getAttribute('role') === 'slider' ? 14 : measuredControlWidth

    this.reportResize(
      [{ contentRect: { width: observedWidth }, borderBoxSize: [{ inlineSize: observedWidth }] } as unknown as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    )
  }

  disconnect() {}
}

function mountSliderControl(sliderControlProps: Partial<SliderControlProps> = {}, initialValues = [1000]) {
  const sliderValues = ref(initialValues)
  const appRoot = document.createElement('div')
  document.body.append(appRoot)

  const app = createApp({
    render: () =>
      h(KSliderControl, {
        'min': 0,
        'max': 2000,
        'step': 10,
        ...sliderControlProps,
        'modelValue': sliderValues.value,
        'onUpdate:modelValue': (nextValues: number[]) => {
          sliderValues.value = nextValues
        },
      }),
  })
  app.mount(appRoot)
  mountedApps.push(app)

  return {
    appRoot,
    sliderValues,
    findControl: () => appRoot.querySelector<HTMLElement>('[data-orientation="horizontal"]:not([role])')!,
    findThumb: () => appRoot.querySelector<HTMLElement>('[role="slider"]')!,
    findThumbs: () => [...appRoot.querySelectorAll<HTMLElement>('[role="slider"]')],
    findRange: () => appRoot.querySelector<HTMLElement>('[data-orientation="horizontal"]:not([role]) > span > span')!,
    findMarks: () => [...appRoot.querySelectorAll<HTMLElement>('.slider-mark-position')],
  }
}

function pressKey(keyTarget: HTMLElement, key: string, keyOptions: KeyboardEventInit = {}) {
  keyTarget.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...keyOptions }))
}

function dispatchPointer(pointerTarget: HTMLElement, pointerType: string, clientX: number) {
  pointerTarget.dispatchEvent(
    new PointerEvent(pointerType, { clientX, pointerId: 1, button: 0, bubbles: true, cancelable: true }),
  )
}

beforeEach(() => {
  const capturedPointers = new WeakMap<Element, Set<number>>()

  vi.stubGlobal('ResizeObserver', ImmediateResizeObserver)
  vi.spyOn(HTMLElement.prototype, 'setPointerCapture').mockImplementation(function (this: HTMLElement, pointerId) {
    capturedPointers.set(this, new Set([pointerId]))
  })
  vi.spyOn(HTMLElement.prototype, 'hasPointerCapture').mockImplementation(function (this: HTMLElement, pointerId) {
    return capturedPointers.get(this)?.has(pointerId) ?? false
  })
  vi.spyOn(HTMLElement.prototype, 'releasePointerCapture').mockImplementation(function (this: HTMLElement) {
    capturedPointers.delete(this)
  })
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains('slider-mark-position')) {
      const markIndex = [...(this.parentElement?.children ?? [])].indexOf(this)
      const markLayout = this.classList.contains('w-min') ? 'wrapped' : 'inline'

      return { ...markBoxesByLayout[markLayout][markIndex], width: 0, top: 0, bottom: 0 } as DOMRect
    }

    return { left: 50, right: 50 + measuredControlWidth, width: measuredControlWidth, top: 0, bottom: 10 } as DOMRect
  })

  markBoxesByLayout = { inline: [], wrapped: [] }
})

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('KSliderControl', () => {
  it('describes the value to assistive technologies', () => {
    const { findThumb } = mountSliderControl({ thumbAttributes: { 'aria-labelledby': 'request-timeout-label' } })

    expect(findThumb().getAttribute('aria-valuemin')).toBe('0')
    expect(findThumb().getAttribute('aria-valuenow')).toBe('1000')
    expect(findThumb().getAttribute('aria-valuemax')).toBe('2000')
    expect(findThumb().getAttribute('aria-orientation')).toBe('horizontal')
    expect(findThumb().getAttribute('aria-labelledby')).toBe('request-timeout-label')
    expect(findThumb().tabIndex).toBe(0)
  })

  it('fills the range and keeps the thumb inside the track like Radix', () => {
    const { findRange, findThumb } = mountSliderControl({}, [1250])

    expect(findRange().style.right).toBe('37.5%')
    expect(findThumb().parentElement?.style.left).toBe('calc(62.5% + var(--slider-thumb-size) * -0.125)')
  })

  it('moves by one step with the arrows and by ten steps with Shift or the page keys', async () => {
    const { sliderValues, findThumb } = mountSliderControl()

    pressKey(findThumb(), 'ArrowRight')
    await nextTick()
    expect(sliderValues.value).toEqual([1010])

    pressKey(findThumb(), 'ArrowDown')
    await nextTick()
    expect(sliderValues.value).toEqual([1000])

    pressKey(findThumb(), 'ArrowUp', { shiftKey: true })
    await nextTick()
    expect(sliderValues.value).toEqual([1100])

    pressKey(findThumb(), 'PageDown')
    await nextTick()
    expect(sliderValues.value).toEqual([1000])
  })

  it('jumps to the ends with Home and End', async () => {
    const { sliderValues, findThumb } = mountSliderControl()

    pressKey(findThumb(), 'End')
    await nextTick()
    expect(sliderValues.value).toEqual([2000])

    pressKey(findThumb(), 'Home')
    await nextTick()
    expect(sliderValues.value).toEqual([0])
  })

  it('lands on the next step when the value sits between two steps', async () => {
    const { sliderValues, findThumb } = mountSliderControl({}, [1005])

    pressKey(findThumb(), 'ArrowLeft')
    await nextTick()

    expect(sliderValues.value).toEqual([1000])
  })

  it('moves to the step under the pointer and keeps following it while pressed', async () => {
    const { sliderValues, findControl, findThumb } = mountSliderControl()
    const track = findControl().firstElementChild as HTMLElement

    dispatchPointer(track, 'pointerdown', 50 + 75)
    await nextTick()
    expect(sliderValues.value).toEqual([500])
    expect(document.activeElement).toBe(findThumb())

    dispatchPointer(track, 'pointermove', 50 + 301)
    await nextTick()
    expect(sliderValues.value).toEqual([2000])

    dispatchPointer(track, 'pointerup', 50 + 301)
    dispatchPointer(track, 'pointermove', 50)
    await nextTick()
    expect(sliderValues.value).toEqual([2000])
  })

  it('animates value changes by distance, and follows the pointer without animation', async () => {
    const { findControl, findThumb } = mountSliderControl()
    const readTransitionDuration = () => findControl().style.getPropertyValue('--slider-value-transition-duration')

    expect(readTransitionDuration()).toBe('0ms')

    pressKey(findThumb(), 'ArrowRight')
    await nextTick()
    expect(readTransitionDuration()).toBe('100ms')

    pressKey(findThumb(), 'Home')
    await nextTick()
    expect(readTransitionDuration()).toBe('151.5ms')

    dispatchPointer(findControl().firstElementChild as HTMLElement, 'pointerdown', 50 + 150)
    await nextTick()
    expect(readTransitionDuration()).toBe('0ms')
  })

  it('ignores the keyboard and the pointer when disabled', async () => {
    const { sliderValues, findControl, findThumb } = mountSliderControl({ disabled: true })

    expect(findThumb().hasAttribute('tabindex')).toBe(false)
    expect(findThumb().getAttribute('aria-disabled')).toBe('true')

    pressKey(findThumb(), 'End')
    dispatchPointer(findControl().firstElementChild as HTMLElement, 'pointerdown', 50)
    await nextTick()

    expect(sliderValues.value).toEqual([1000])
  })

  it('submits its value with a form and returns to its first value when the form resets', async () => {
    const form = document.createElement('form')
    const formInputListener = vi.fn()
    form.addEventListener('input', formInputListener)
    document.body.append(form)

    const sliderValues = ref([1000])
    const app = createApp({
      render: () =>
        h(KSliderControl, {
          'min': 0,
          'max': 2000,
          'step': 10,
          'name': 'request-timeout',
          'modelValue': sliderValues.value,
          'onUpdate:modelValue': (nextValues: number[]) => {
            sliderValues.value = nextValues
          },
        }),
    })
    app.mount(form)
    mountedApps.push(app)

    pressKey(form.querySelector<HTMLElement>('[role="slider"]')!, 'End')
    await nextTick()
    await nextTick()

    expect(new FormData(form).get('request-timeout')).toBe('2000')
    expect(formInputListener).toHaveBeenCalledOnce()

    form.dispatchEvent(new Event('reset'))
    await nextTick()

    expect(sliderValues.value).toEqual([1000])
  })

  describe('two thumbs', () => {
    const amountRange = { min: 0, max: 2000, step: 10, thumbLabels: ['Minimum', 'Maximum'] }

    it('names each thumb and bounds it by its neighbor', () => {
      const { findThumbs, findRange } = mountSliderControl({ ...amountRange, minRange: 100 }, [500, 1500])
      const [startThumb, endThumb] = findThumbs()

      expect(startThumb!.getAttribute('aria-label')).toBe('Minimum')
      expect(startThumb!.getAttribute('aria-valuemin')).toBe('0')
      expect(startThumb!.getAttribute('aria-valuemax')).toBe('1400')
      expect(endThumb!.getAttribute('aria-label')).toBe('Maximum')
      expect(endThumb!.getAttribute('aria-valuemin')).toBe('600')
      expect(endThumb!.getAttribute('aria-valuemax')).toBe('2000')
      expect(findRange().style.left).toBe('25%')
      expect(findRange().style.right).toBe('25%')
    })

    it('moves the thumb closest to where the track is pressed', async () => {
      const { sliderValues, findControl, findThumbs } = mountSliderControl(amountRange, [500, 1500])
      const track = findControl().firstElementChild as HTMLElement

      dispatchPointer(track, 'pointerdown', 50 + 255)
      dispatchPointer(track, 'pointerup', 50 + 255)
      await nextTick()
      expect(sliderValues.value).toEqual([500, 1700])
      expect(document.activeElement).toBe(findThumbs()[1])

      dispatchPointer(track, 'pointerdown', 50 + 30)
      dispatchPointer(track, 'pointerup', 50 + 30)
      await nextTick()
      expect(sliderValues.value).toEqual([200, 1700])
      expect(document.activeElement).toBe(findThumbs()[0])
    })

    it('stops a dragged thumb at the other one, minRange apart', async () => {
      const { sliderValues, findThumbs } = mountSliderControl({ ...amountRange, minRange: 100 }, [500, 1500])
      const startThumb = findThumbs()[0]!

      dispatchPointer(startThumb, 'pointerdown', 50 + 75)
      dispatchPointer(startThumb, 'pointermove', 50 + 280)
      await nextTick()

      expect(sliderValues.value).toEqual([1400, 1500])
    })

    it('moves the focused thumb with the keyboard, Home and End staying within its bounds', async () => {
      const { sliderValues, findThumbs } = mountSliderControl(amountRange, [500, 1500])
      const endThumb = findThumbs()[1]!

      endThumb.focus()
      pressKey(endThumb, 'ArrowRight')
      await nextTick()
      expect(sliderValues.value).toEqual([500, 1510])

      pressKey(endThumb, 'Home')
      await nextTick()
      expect(sliderValues.value).toEqual([500, 500])

      const startThumb = findThumbs()[0]!
      startThumb.focus()
      pressKey(startThumb, 'End')
      await nextTick()
      expect(sliderValues.value).toEqual([500, 500])
    })

    it('lets stacked thumbs part in the direction of the drag', async () => {
      const { sliderValues, findThumbs } = mountSliderControl(amountRange, [2000, 2000])
      const topThumb = findThumbs()[1]!

      dispatchPointer(topThumb, 'pointerdown', 50 + 293)
      dispatchPointer(topThumb, 'pointermove', 50 + 150)
      await nextTick()

      expect(sliderValues.value).toEqual([1000, 2000])
    })

    it('puts the last moved thumb above the other one', async () => {
      const { findThumbs } = mountSliderControl(amountRange, [1000, 1000])

      findThumbs()[0]!.focus()
      await nextTick()

      expect(findThumbs()[0]!.parentElement!.className).toContain('z-1')
      expect(findThumbs()[1]!.parentElement!.className).not.toContain('z-1')
    })

    it('submits both values under the same name', () => {
      const form = document.createElement('form')
      document.body.append(form)
      const app = createApp({
        render: () => h(KSliderControl, { ...amountRange, name: 'amount', modelValue: [500, 1500] }),
      })
      app.mount(form)
      mountedApps.push(app)

      expect(new FormData(form).getAll('amount[]')).toEqual(['500', '1500'])
    })
  })

  describe('marks', () => {
    const riskToleranceMarks: SliderMark[] = [
      { value: 3, label: 'Aggressive' },
      { value: 1, label: 'Conservative' },
      { value: 2, label: 'Moderate growth' },
    ]

    async function waitForMarksLayout() {
      for (let tickIndex = 0; tickIndex < 4; tickIndex += 1) await nextTick()
    }

    it('places the marks in value order', async () => {
      markBoxesByLayout.inline = [
        { left: 0, right: 70 },
        { left: 105, right: 195 },
        { left: 240, right: 300 },
      ]
      const { findMarks } = mountSliderControl({ min: 1, max: 3, step: 1, marks: riskToleranceMarks }, [2])
      await waitForMarksLayout()

      expect(findMarks().map((markElement) => markElement.textContent)).toEqual([
        'Conservative',
        'Moderate growth',
        'Aggressive',
      ])
      expect(findMarks().map((markElement) => markElement.style.getPropertyValue('--slider-mark-ratio'))).toEqual([
        '0',
        '0.5',
        '1',
      ])
      expect(findMarks().every((markElement) => !markElement.classList.contains('w-min'))).toBe(true)
    })

    it('wraps the labels when they collide', async () => {
      markBoxesByLayout.inline = [
        { left: 0, right: 70 },
        { left: 70, right: 160 },
        { left: 172, right: 230 },
      ]
      markBoxesByLayout.wrapped = [
        { left: 0, right: 70 },
        { left: 90, right: 140 },
        { left: 172, right: 230 },
      ]
      const { findMarks } = mountSliderControl({ min: 1, max: 3, step: 1, marks: riskToleranceMarks }, [2])
      await waitForMarksLayout()

      expect(findMarks().every((markElement) => markElement.classList.contains('w-min'))).toBe(true)
    })

    it('hides every label when they still collide once wrapped', async () => {
      markBoxesByLayout.inline = [
        { left: 0, right: 70 },
        { left: 5, right: 95 },
        { left: 40, right: 100 },
      ]
      markBoxesByLayout.wrapped = [
        { left: 0, right: 70 },
        { left: 25, right: 75 },
        { left: 40, right: 100 },
      ]
      const { findMarks } = mountSliderControl({ min: 1, max: 3, step: 1, marks: riskToleranceMarks }, [2])
      await waitForMarksLayout()

      expect(findMarks().every((markElement) => markElement.classList.contains('hidden'))).toBe(true)
    })
  })
})
