import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref, type App } from 'vue'
import { KAlert, type AlertProps } from '.'

const mountedApps: App[] = []

function mountAlert(alertProps: AlertProps = {}) {
  const isOpen = ref(true)
  const appRoot = document.createElement('div')
  document.body.append(appRoot)

  const app = createApp({
    render: () =>
      h(KAlert, {
        'title': 'Card expires soon',
        'description': 'Your Visa ending in 4821 expires at the end of the month.',
        ...alertProps,
        'open': isOpen.value,
        'onUpdate:open': (nextOpenState: boolean) => {
          isOpen.value = nextOpenState
        },
      }),
  })
  app.mount(appRoot)
  mountedApps.push(app)

  return {
    isOpen,
    findAlert: () => appRoot.querySelector<HTMLElement>('.rounded-xl'),
    findCloseButton: () => appRoot.querySelector<HTMLButtonElement>('button[aria-label="Close"]'),
  }
}

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
})

describe('KAlert', () => {
  it('renders its title and description', () => {
    const { findAlert } = mountAlert()

    expect(findAlert()?.textContent).toContain('Card expires soon')
    expect(findAlert()?.textContent).toContain('Your Visa ending in 4821')
  })

  it('announces only danger alerts right away', () => {
    expect(mountAlert({ color: 'danger' }).findAlert()?.getAttribute('role')).toBe('alert')
    expect(mountAlert({ color: 'warning' }).findAlert()?.hasAttribute('role')).toBe(false)
  })

  describe('closing', () => {
    it('has no close button unless closable', () => {
      const { findCloseButton } = mountAlert()

      expect(findCloseButton()).toBeNull()
    })

    it('shows a close button named for screen readers when closable', () => {
      const { findCloseButton } = mountAlert({ closable: true })

      expect(findCloseButton()?.getAttribute('type')).toBe('button')
    })

    it('hides itself and updates its open state when the close button is clicked', async () => {
      const { isOpen, findAlert, findCloseButton } = mountAlert({ closable: true })

      findCloseButton()?.click()
      await nextTick()

      expect(isOpen.value).toBe(false)
      expect(findAlert()).toBeNull()
    })

    it('shows again when its open state is set back to true', async () => {
      const { isOpen, findAlert, findCloseButton } = mountAlert({ closable: true })
      findCloseButton()?.click()
      await nextTick()

      isOpen.value = true
      await nextTick()

      expect(findAlert()).not.toBeNull()
    })
  })
})
