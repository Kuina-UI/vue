import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, shallowRef, Teleport, type App } from 'vue'
import { renderToString } from 'vue/server-renderer'
import type { FloatingSide, FloatingStrategy } from '../types/floating-position'
import { useFloatingPosition } from './useFloatingPosition'

interface FloatingDropdownSetup {
  open?: boolean
  floatingOffsetParent?: HTMLElement
}

const mountedApps: App[] = []
const windowPropertyRestorers: Array<() => void> = []

async function flushVueUpdates() {
  for (let tickIndex = 0; tickIndex < 5; tickIndex++) await nextTick()
}

function overrideWindowProperty(propertyName: 'scrollY' | 'devicePixelRatio', propertyValue: number) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(window, propertyName)
  Object.defineProperty(window, propertyName, { value: propertyValue, configurable: true })
  windowPropertyRestorers.push(() => {
    if (originalDescriptor) Object.defineProperty(window, propertyName, originalDescriptor)
    else Reflect.deleteProperty(window, propertyName)
  })
}

function scrollPageTo(pageScrollY: number) {
  overrideWindowProperty('scrollY', pageScrollY)
  document.dispatchEvent(new Event('scroll'))
}

function defineFloatingDropdown(dropdownSetup: FloatingDropdownSetup = {}) {
  const isOpen = ref(dropdownSetup.open ?? false)
  const side = ref<FloatingSide>('bottom')
  const strategy = ref<FloatingStrategy>('absolute')
  const anchorBounds = { x: 100, y: 50, width: 200, height: 40 }
  const anchorElement = shallowRef<HTMLElement>()
  const floatingElement = shallowRef<HTMLElement>()
  const readAnchorBounds = vi.fn(
    () => new DOMRect(anchorBounds.x, anchorBounds.y, anchorBounds.width, anchorBounds.height),
  )
  let floatingPosition!: ReturnType<typeof useFloatingPosition>

  function registerAnchor(anchorNode: unknown) {
    if (anchorNode instanceof HTMLElement) anchorNode.getBoundingClientRect = readAnchorBounds
    anchorElement.value = anchorNode instanceof HTMLElement ? anchorNode : undefined
  }

  function registerFloating(floatingNode: unknown) {
    if (floatingNode instanceof HTMLElement) {
      Object.defineProperty(floatingNode, 'offsetWidth', { value: 256, configurable: true })
      Object.defineProperty(floatingNode, 'offsetHeight', { value: 300, configurable: true })
      if (dropdownSetup.floatingOffsetParent) {
        Object.defineProperty(floatingNode, 'offsetParent', { value: dropdownSetup.floatingOffsetParent })
      }
    }
    floatingElement.value = floatingNode instanceof HTMLElement ? floatingNode : undefined
  }

  const FloatingDropdown = defineComponent({
    setup() {
      floatingPosition = useFloatingPosition(anchorElement, floatingElement, {
        open: isOpen,
        side,
        strategy,
        sideOffset: 6,
      })

      return () => [
        h('button', { ref: registerAnchor }, 'Trigger'),
        h(
          Teleport,
          { to: 'body' },
          isOpen.value
            ? [h('div', { id: 'floating-panel', ref: registerFloating, style: floatingPosition.floatingStyles.value })]
            : [],
        ),
      ]
    },
  })

  return {
    FloatingDropdown,
    isOpen,
    side,
    strategy,
    anchorBounds,
    readAnchorBounds,
    getFloatingPosition: () => floatingPosition,
  }
}

function mountFloatingDropdown(dropdownSetup: FloatingDropdownSetup = {}) {
  const floatingDropdown = defineFloatingDropdown(dropdownSetup)
  const scrollContainer = document.createElement('div')
  const appRoot = document.createElement('div')
  scrollContainer.append(appRoot)
  document.body.append(scrollContainer)

  const app = createApp(floatingDropdown.FloatingDropdown)
  app.mount(appRoot)
  mountedApps.push(app)

  return {
    ...floatingDropdown,
    app,
    scrollContainer,
    floatingPanelStyle: () => document.getElementById('floating-panel')?.style,
  }
}

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
  windowPropertyRestorers.splice(0).reverse().forEach((restoreWindowProperty) => restoreWindowProperty())
  vi.restoreAllMocks()
})

describe('useFloatingPosition', () => {
  it('stays hidden until it has a position', () => {
    const { getFloatingPosition } = mountFloatingDropdown()

    expect(getFloatingPosition().floatingStyles.value).toMatchObject({ position: 'absolute', visibility: 'hidden' })
    expect(getFloatingPosition().isPositioned.value).toBe(false)
  })

  it('tells when the floating element has its first position', async () => {
    const { isOpen, getFloatingPosition } = mountFloatingDropdown()

    isOpen.value = true
    await flushVueUpdates()

    expect(getFloatingPosition().isPositioned.value).toBe(true)
  })

  it('places the floating element within the same tick as opening, before the browser paints', async () => {
    const { isOpen, floatingPanelStyle } = mountFloatingDropdown()

    isOpen.value = true
    await flushVueUpdates()

    expect(floatingPanelStyle()).toMatchObject({ top: '96px', left: '100px', visibility: '' })
  })

  it('places the floating element when mounted already open', async () => {
    const { floatingPanelStyle } = mountFloatingDropdown({ open: true })

    await flushVueUpdates()

    expect(floatingPanelStyle()).toMatchObject({ top: '96px', left: '100px' })
  })

  it('exposes the anchor width as a CSS variable', async () => {
    const { floatingPanelStyle } = mountFloatingDropdown({ open: true })

    await flushVueUpdates()

    expect(floatingPanelStyle()?.getPropertyValue('--floating-anchor-width')).toBe('200px')
  })

  it('opens above the anchor and exposes the placement it used', async () => {
    const { side, floatingPanelStyle, getFloatingPosition } = mountFloatingDropdown({ open: true })

    side.value = 'top'
    await flushVueUpdates()

    expect(floatingPanelStyle()?.top).toBe('-256px')
    expect(getFloatingPosition().floatingPlacement.value.side).toBe('top')
  })

  it('keeps its page coordinates without recomputing when the page scrolls', async () => {
    const { anchorBounds, readAnchorBounds, floatingPanelStyle } = mountFloatingDropdown({ open: true })
    await flushVueUpdates()
    const anchorReadsBeforeScroll = readAnchorBounds.mock.calls.length

    anchorBounds.y = -450
    scrollPageTo(500)
    await flushVueUpdates()

    expect(readAnchorBounds.mock.calls.length).toBe(anchorReadsBeforeScroll)
    expect(floatingPanelStyle()?.top).toBe('96px')
  })

  it('follows the anchor when a container around it scrolls', async () => {
    const { anchorBounds, scrollContainer, floatingPanelStyle } = mountFloatingDropdown({ open: true })
    await flushVueUpdates()

    anchorBounds.y = 20
    scrollContainer.dispatchEvent(new Event('scroll'))
    await flushVueUpdates()

    expect(floatingPanelStyle()?.top).toBe('66px')
  })

  it('ignores scrolling elements that do not contain the anchor', async () => {
    const { readAnchorBounds } = mountFloatingDropdown({ open: true })
    await flushVueUpdates()
    const anchorReadsBeforeScroll = readAnchorBounds.mock.calls.length
    const unrelatedScrollContainer = document.createElement('div')
    document.body.append(unrelatedScrollContainer)

    unrelatedScrollContainer.dispatchEvent(new Event('scroll'))
    await flushVueUpdates()

    expect(readAnchorBounds.mock.calls.length).toBe(anchorReadsBeforeScroll)
  })

  it('uses viewport coordinates and follows page scroll with the fixed strategy', async () => {
    const { strategy, anchorBounds, floatingPanelStyle } = mountFloatingDropdown({ open: true })
    overrideWindowProperty('scrollY', 500)

    strategy.value = 'fixed'
    await flushVueUpdates()

    expect(floatingPanelStyle()).toMatchObject({ position: 'fixed', top: '96px' })

    anchorBounds.y = 10
    scrollPageTo(540)
    await flushVueUpdates()

    expect(floatingPanelStyle()?.top).toBe('56px')
  })

  it('adds the page scroll to its coordinates with the absolute strategy', async () => {
    overrideWindowProperty('scrollY', 500)
    const { floatingPanelStyle } = mountFloatingDropdown({ open: true })

    await flushVueUpdates()

    expect(floatingPanelStyle()?.top).toBe('596px')
  })

  it('places itself relative to a positioned containing block', async () => {
    const positionedContainer = document.createElement('div')
    positionedContainer.getBoundingClientRect = () => new DOMRect(10, 20, 800, 600)
    const { floatingPanelStyle } = mountFloatingDropdown({ open: true, floatingOffsetParent: positionedContainer })

    await flushVueUpdates()

    expect(floatingPanelStyle()).toMatchObject({ top: '76px', left: '90px' })
  })

  it('updates the anchor width when the window is resized', async () => {
    const { anchorBounds, floatingPanelStyle } = mountFloatingDropdown({ open: true })
    await flushVueUpdates()

    anchorBounds.width = 320
    window.dispatchEvent(new Event('resize'))
    await flushVueUpdates()

    expect(floatingPanelStyle()?.getPropertyValue('--floating-anchor-width')).toBe('320px')
  })

  it('rounds its coordinates to device pixels', async () => {
    overrideWindowProperty('devicePixelRatio', 2)
    const { anchorBounds, isOpen, floatingPanelStyle } = mountFloatingDropdown()
    anchorBounds.x = 100.3

    isOpen.value = true
    await flushVueUpdates()

    expect(floatingPanelStyle()?.left).toBe('100.5px')
  })

  it('removes its listeners and keeps its last position when closed', async () => {
    const addListener = vi.spyOn(window, 'addEventListener')
    const removeListener = vi.spyOn(window, 'removeEventListener')
    const { isOpen, getFloatingPosition } = mountFloatingDropdown({ open: true })
    await flushVueUpdates()

    isOpen.value = false
    await flushVueUpdates()

    const addedListeners = addListener.mock.calls.map(([eventName, listener]) => [eventName, listener])
    const removedListeners = removeListener.mock.calls.map(([eventName, listener]) => [eventName, listener])
    expect(addedListeners.map(([eventName]) => eventName)).toEqual(['scroll', 'resize'])
    expect(removedListeners).toEqual(addedListeners)
    expect(getFloatingPosition().floatingStyles.value).toMatchObject({ top: '96px', left: '100px' })
  })

  it('removes its listeners when unmounted', async () => {
    const addListener = vi.spyOn(window, 'addEventListener')
    const removeListener = vi.spyOn(window, 'removeEventListener')
    const { app } = mountFloatingDropdown({ open: true })
    await flushVueUpdates()

    app.unmount()
    mountedApps.splice(mountedApps.indexOf(app), 1)

    const addedListeners = addListener.mock.calls.map(([eventName, listener]) => [eventName, listener])
    const removedListeners = removeListener.mock.calls.map(([eventName, listener]) => [eventName, listener])
    expect(removedListeners).toEqual(addedListeners)
  })

  it('renders hidden on the server, without touching the window', async () => {
    const addListener = vi.spyOn(window, 'addEventListener')
    const { FloatingDropdown, readAnchorBounds } = defineFloatingDropdown({ open: true })
    const serverRenderContext: { teleports?: Record<string, string> } = {}

    await renderToString(createSSRApp(FloatingDropdown), serverRenderContext)

    expect(serverRenderContext.teleports?.body).toContain('visibility:hidden')
    expect(addListener).not.toHaveBeenCalled()
    expect(readAnchorBounds).not.toHaveBeenCalled()
  })
})
