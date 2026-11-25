import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref, shallowRef, type App } from 'vue'
import { useDismissOnOutsidePointerDown } from './useDismissOnOutsidePointerDown'

const mountedApps: App[] = []

function mountDismissableLayer(initiallyActive = true) {
  const isActive = ref(initiallyActive)
  const onDismiss = vi.fn()
  const insideElement = shallowRef<HTMLElement>()

  const DismissableLayer = defineComponent({
    setup() {
      useDismissOnOutsidePointerDown([insideElement], { active: isActive, onDismiss })

      return () =>
        h('div', { id: 'inside-element', ref: (insideNode: unknown) => {
          insideElement.value = insideNode instanceof HTMLElement ? insideNode : undefined
        } }, [h('button', { id: 'inside-button' })])
    },
  })

  const appRoot = document.createElement('div')
  const outsideElement = document.createElement('div')
  document.body.append(appRoot, outsideElement)
  const app = createApp(DismissableLayer)
  app.mount(appRoot)
  mountedApps.push(app)

  return { app, isActive, onDismiss, outsideElement }
}

function pressPointerOn(pressedElement: Element | null) {
  pressedElement?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
}

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
})

describe('useDismissOnOutsidePointerDown', () => {
  it('dismisses when a pointer goes down outside', () => {
    const { onDismiss, outsideElement } = mountDismissableLayer()

    pressPointerOn(outsideElement)

    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('ignores a pointer going down inside, including on a descendant', () => {
    const { onDismiss } = mountDismissableLayer()

    pressPointerOn(document.getElementById('inside-element'))
    pressPointerOn(document.getElementById('inside-button'))

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('does nothing while inactive', () => {
    const { onDismiss, outsideElement } = mountDismissableLayer(false)

    pressPointerOn(outsideElement)

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('stops listening once it becomes inactive', async () => {
    const { isActive, onDismiss, outsideElement } = mountDismissableLayer()

    isActive.value = false
    await nextTick()
    pressPointerOn(outsideElement)

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('stops listening once unmounted', () => {
    const { app, onDismiss, outsideElement } = mountDismissableLayer()

    app.unmount()
    mountedApps.splice(mountedApps.indexOf(app), 1)
    pressPointerOn(outsideElement)

    expect(onDismiss).not.toHaveBeenCalled()
  })
})
