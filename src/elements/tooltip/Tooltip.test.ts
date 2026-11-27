import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, createTextVNode, defineComponent, h, nextTick, ref, type App, type Slots } from 'vue'
import { KTooltip, type TooltipProps } from '.'

const mountedApps: App[] = []

const exportDescription = 'Downloads every transaction from the selected period as a CSV file.'

function renderExportButton() {
  return [h('button', { type: 'button' }, 'Export')]
}

function mountTooltip(tooltipProps: Partial<TooltipProps> & Record<string, unknown> = {}, tooltipSlots?: Partial<Slots>) {
  const isOpen = ref(false)
  const appRoot = document.createElement('div')
  document.body.append(appRoot)

  const app = createApp({
    render: () =>
      h(
        KTooltip,
        {
          'content': exportDescription,
          ...tooltipProps,
          'open': isOpen.value,
          'onUpdate:open': (nextOpenState: boolean) => {
            isOpen.value = nextOpenState
          },
        },
        tooltipSlots ?? { default: renderExportButton },
      ),
  })
  app.mount(appRoot)
  mountedApps.push(app)

  function findTrigger() {
    const triggerElement = appRoot.firstElementChild
    if (!(triggerElement instanceof HTMLElement)) throw new Error('The tooltip trigger is missing.')
    return triggerElement
  }

  return {
    isOpen,
    appRoot,
    findTrigger,
    findBubble: () => document.querySelector<HTMLElement>(`[role="tooltip"]`),
  }
}

async function flushVueUpdates() {
  for (let tickIndex = 0; tickIndex < 5; tickIndex++) await nextTick()
}

async function hoverTrigger(triggerElement: HTMLElement, pointerType = 'mouse') {
  triggerElement.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType }))
  await flushVueUpdates()
}

async function waitFor(milliseconds: number) {
  vi.advanceTimersByTime(milliseconds)
  await flushVueUpdates()
}

async function focusTrigger(triggerElement: HTMLElement) {
  triggerElement.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
  await flushVueUpdates()
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('KTooltip', () => {
  describe('trigger', () => {
    it('renders the slot element itself, without a wrapper', () => {
      const { appRoot, findTrigger } = mountTooltip()

      expect(findTrigger().tagName).toBe('BUTTON')
      expect(appRoot.children).toHaveLength(1)
    })

    it('forwards its other attributes to the trigger', () => {
      const { findTrigger } = mountTooltip({ 'data-testid': 'export-trigger' })

      expect(findTrigger().dataset.testid).toBe('export-trigger')
    })

    it('works with a component as trigger', async () => {
      const ExportButton = defineComponent({ render: () => h('button', { type: 'button' }, 'Export') })
      const { findTrigger, findBubble } = mountTooltip({}, { default: () => [h(ExportButton)] })

      await focusTrigger(findTrigger())

      expect(findBubble()?.textContent).toBe(exportDescription)
    })

    it('renders the label as dotted text that can be focused', async () => {
      const { findTrigger } = mountTooltip({ label: 'Available balance' }, {})

      expect(findTrigger().tagName).toBe('SPAN')
      expect(findTrigger().getAttribute('tabindex')).toBe('0')
      expect(findTrigger().textContent).toBe('Available balance')
      expect(findTrigger().className).toContain('decoration-transparent')

      await focusTrigger(findTrigger())

      expect(findTrigger().className).toContain('decoration-muted')
    })

    it('turns plain text in the slot into the same dotted text', () => {
      const { findTrigger } = mountTooltip({}, { default: () => [createTextVNode('Available balance')] })

      expect(findTrigger().tagName).toBe('SPAN')
      expect(findTrigger().getAttribute('tabindex')).toBe('0')
    })
  })

  describe('hover', () => {
    it('opens after the open delay', async () => {
      const { findTrigger, findBubble, isOpen } = mountTooltip()

      await hoverTrigger(findTrigger())
      await waitFor(149)

      expect(findBubble()).toBeNull()

      await waitFor(1)

      expect(isOpen.value).toBe(true)
      expect(findBubble()?.textContent).toBe(exportDescription)
      expect(findTrigger().dataset.state).toBe('delayed-open')
    })

    it('uses the openDelay prop', async () => {
      const { findTrigger, findBubble } = mountTooltip({ openDelay: 500 })

      await hoverTrigger(findTrigger())
      await waitFor(499)

      expect(findBubble()).toBeNull()

      await waitFor(1)

      expect(findBubble()).not.toBeNull()
    })

    it('closes as soon as the pointer leaves, and cancels an open still waiting', async () => {
      const { findTrigger, findBubble } = mountTooltip()

      await hoverTrigger(findTrigger())
      await waitFor(150)
      findTrigger().dispatchEvent(new PointerEvent('pointerleave'))
      await flushVueUpdates()

      expect(findBubble()).toBeNull()

      await waitFor(350)
      await hoverTrigger(findTrigger())
      findTrigger().dispatchEvent(new PointerEvent('pointerleave'))
      await waitFor(150)

      expect(findBubble()).toBeNull()
    })

    it('opens again without delay when the pointer comes back within 300ms', async () => {
      const { findTrigger, findBubble } = mountTooltip()

      await hoverTrigger(findTrigger())
      await waitFor(150)
      findTrigger().dispatchEvent(new PointerEvent('pointerleave'))
      await waitFor(299)
      await hoverTrigger(findTrigger())

      expect(findBubble()).not.toBeNull()
      expect(findTrigger().dataset.state).toBe('instant-open')
    })

    it('waits for the delay again once 300ms have passed', async () => {
      const { findTrigger, findBubble } = mountTooltip()

      await hoverTrigger(findTrigger())
      await waitFor(150)
      findTrigger().dispatchEvent(new PointerEvent('pointerleave'))
      await waitFor(300)
      await hoverTrigger(findTrigger())

      expect(findBubble()).toBeNull()
    })

    it('ignores touch', async () => {
      const { findTrigger, findBubble } = mountTooltip()

      await hoverTrigger(findTrigger(), 'touch')
      await waitFor(150)

      expect(findBubble()).toBeNull()
    })
  })

  describe('focus', () => {
    it('opens at once on keyboard focus and closes on blur', async () => {
      const { findTrigger, findBubble } = mountTooltip()

      await focusTrigger(findTrigger())

      expect(findBubble()).not.toBeNull()
      expect(findTrigger().dataset.state).toBe('instant-open')

      findTrigger().dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
      await flushVueUpdates()

      expect(findBubble()).toBeNull()
    })

    it('does not open on the focus that follows a click', async () => {
      const { findTrigger, findBubble } = mountTooltip()

      findTrigger().dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      await focusTrigger(findTrigger())

      expect(findBubble()).toBeNull()
    })
  })

  describe('closing', () => {
    async function openByFocus(tooltipProps: Partial<TooltipProps> = {}) {
      const mountedTooltip = mountTooltip(tooltipProps)
      await focusTrigger(mountedTooltip.findTrigger())
      return mountedTooltip
    }

    it('closes when the trigger is pressed or clicked', async () => {
      const pressedTooltip = await openByFocus()

      pressedTooltip.findTrigger().dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      await flushVueUpdates()

      expect(pressedTooltip.isOpen.value).toBe(false)

      const clickedTooltip = await openByFocus()

      clickedTooltip.findTrigger().dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await flushVueUpdates()

      expect(clickedTooltip.isOpen.value).toBe(false)
    })

    it('keeps the tooltip for 400ms after it opens with preventUnintentionalClickToClose', async () => {
      const { findTrigger, isOpen } = await openByFocus({ preventUnintentionalClickToClose: true })

      findTrigger().dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await flushVueUpdates()

      expect(isOpen.value).toBe(true)

      await waitFor(400)
      findTrigger().dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await flushVueUpdates()

      expect(isOpen.value).toBe(false)
    })

    it('closes with Escape', async () => {
      const { isOpen } = await openByFocus()

      const escapeKeydown = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      document.body.dispatchEvent(escapeKeydown)
      await flushVueUpdates()

      expect(isOpen.value).toBe(false)
      expect(escapeKeydown.defaultPrevented).toBe(true)
    })

    it('closes when a pointer goes down outside', async () => {
      const { isOpen } = await openByFocus()

      document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      await flushVueUpdates()

      expect(isOpen.value).toBe(false)
    })

    it('closes when something around the trigger scrolls, not when an unrelated area does', async () => {
      const { appRoot, isOpen } = await openByFocus()
      const unrelatedScrollArea = document.createElement('div')
      document.body.append(unrelatedScrollArea)

      unrelatedScrollArea.dispatchEvent(new Event('scroll'))
      await flushVueUpdates()

      expect(isOpen.value).toBe(true)

      appRoot.dispatchEvent(new Event('scroll'))
      await flushVueUpdates()

      expect(isOpen.value).toBe(false)
    })

    it('closes when another tooltip opens', async () => {
      const firstTooltip = await openByFocus()
      const secondTooltip = await openByFocus()

      expect(secondTooltip.isOpen.value).toBe(true)
      expect(firstTooltip.isOpen.value).toBe(false)
    })
  })

  describe('interactive', () => {
    const triggerRect = { x: 100, y: 200, width: 40, height: 32, top: 200, right: 140, bottom: 232, left: 100 }
    const bubbleRect = { x: -30, y: 120, width: 300, height: 75, top: 120, right: 270, bottom: 195, left: -30 }

    beforeEach(() => {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const measuredRect = this.getAttribute('role') === 'tooltip' ? bubbleRect : triggerRect
        return { ...measuredRect, toJSON: () => measuredRect } as DOMRect
      })
    })

    async function openInteractiveTooltip() {
      const mountedTooltip = mountTooltip({ interactive: true })
      await hoverTrigger(mountedTooltip.findTrigger())
      await waitFor(150)
      mountedTooltip.findTrigger().dispatchEvent(new PointerEvent('pointerleave', { clientX: 120, clientY: 200 }))
      await flushVueUpdates()
      return mountedTooltip
    }

    function movePointerTo(clientX: number, clientY: number) {
      document.body.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX, clientY }))
    }

    it('stays open while the pointer travels from the trigger to the tooltip', async () => {
      const { isOpen } = await openInteractiveTooltip()

      movePointerTo(200, 150)
      await flushVueUpdates()

      expect(isOpen.value).toBe(true)
    })

    it('closes when the pointer strays from that path', async () => {
      const { isOpen } = await openInteractiveTooltip()

      movePointerTo(600, 600)
      await flushVueUpdates()

      expect(isOpen.value).toBe(false)
    })
  })

  describe('accessibility', () => {
    it('describes the trigger with the tooltip only while it is open', async () => {
      const { findTrigger, findBubble } = mountTooltip()

      expect(findTrigger().hasAttribute('aria-describedby')).toBe(false)

      await focusTrigger(findTrigger())

      expect(findBubble()?.id).toBeTruthy()
      expect(findTrigger().getAttribute('aria-describedby')).toBe(findBubble()?.id)
    })

    it('keeps the description the trigger already had', async () => {
      const { findTrigger, findBubble } = mountTooltip(
        {},
        { default: () => [h('button', { 'type': 'button', 'aria-describedby': 'export-hint' }, 'Export')] },
      )

      await focusTrigger(findTrigger())

      expect(findTrigger().getAttribute('aria-describedby')).toBe(`export-hint ${findBubble()?.id}`)
    })
  })

  describe('content', () => {
    it('never opens without content', async () => {
      const { findTrigger, findBubble } = mountTooltip({ content: undefined })

      await focusTrigger(findTrigger())

      expect(findBubble()).toBeNull()
    })

    it('renders the content slot', async () => {
      const { findTrigger, findBubble } = mountTooltip(
        { content: undefined },
        { default: renderExportButton, content: () => [h('strong', 'CSV export')] },
      )

      await focusTrigger(findTrigger())

      expect(findBubble()?.querySelector('strong')?.textContent).toBe('CSV export')
    })
  })

  describe('look', () => {
    async function openTooltipBubble(tooltipProps: Partial<TooltipProps>) {
      const { findTrigger, findBubble } = mountTooltip(tooltipProps)
      await focusTrigger(findTrigger())
      return findBubble()!
    }

    it('caps the width at 300px by default, at maxWidth, or not at all with none', async () => {
      expect((await openTooltipBubble({})).style.maxWidth).toBe('300px')
      expect((await openTooltipBubble({ maxWidth: 200 })).style.maxWidth).toBe('200px')
      expect((await openTooltipBubble({ maxWidth: 'none' })).style.maxWidth).toBe('')
    })

    it('sets the padding from gutterSize', async () => {
      expect((await openTooltipBubble({ gutterSize: 'sm' })).className).toContain('px-3 py-2')
      expect((await openTooltipBubble({})).className).toContain('px-4 py-3')
      expect((await openTooltipBubble({ gutterSize: 'lg' })).className).toContain('px-4.5 py-3.5')
    })

    it('uses the inverted colors and the tight padding when compact', async () => {
      const compactBubble = await openTooltipBubble({ compact: true, gutterSize: 'lg' })

      expect(compactBubble.className).toContain('px-2 py-0.5')
      expect(compactBubble.className).toContain('light:bg-neutral-800')
      expect(compactBubble.className).not.toContain('bg-widget')
      expect(compactBubble.className).not.toContain('px-4.5')
    })

    it('lets ui and class replace the default classes', async () => {
      const customizedBubble = await openTooltipBubble({ ui: { base: 'rounded-none' }, class: 'shadow-none' })

      expect(customizedBubble.className).toContain('rounded-none')
      expect(customizedBubble.className).not.toContain('rounded-lg')
      expect(customizedBubble.className).toContain('shadow-none')
      expect(customizedBubble.className).not.toContain('shadow-lg')
    })
  })
})
