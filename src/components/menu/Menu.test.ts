import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref, type App } from 'vue'
import { KMenu, type MenuEntry, type MenuProps } from '.'

const mountedApps: App[] = []

function createMenuEntries() {
  const selectEdit = vi.fn()
  const selectArchived = vi.fn()
  const togglePending = vi.fn()

  const menuEntries: MenuEntry[] = [
    { label: 'Avery Collins', description: 'avery.collins@example.com', readOnly: true },
    { separator: true },
    { label: 'Edit', shortcut: '⌘E', onSelect: selectEdit },
    { label: 'Archived', disabled: true, onSelect: selectArchived },
    { label: 'Terms & policies', href: 'https://example.com/terms' },
    {
      label: 'Show',
      items: [
        { label: 'Pending', type: 'checkbox', checked: true, onSelect: togglePending },
        { label: 'Transfers', type: 'checkbox' },
      ],
    },
    { label: 'Delete', color: 'danger' },
  ]

  return { menuEntries, selectEdit, selectArchived, togglePending }
}

function mountMenu(menuProps: Partial<MenuProps> = {}) {
  const menuEntryFixtures = createMenuEntries()
  const isOpen = ref(false)
  const appRoot = document.createElement('div')
  const outsideElement = document.createElement('div')
  document.body.append(appRoot, outsideElement)

  const app = createApp({
    render: () =>
      h(KMenu, {
        'label': 'Options',
        'items': menuEntryFixtures.menuEntries,
        ...menuProps,
        'open': isOpen.value,
        'onUpdate:open': (nextOpenState: boolean) => {
          isOpen.value = nextOpenState
        },
      }),
  })
  app.mount(appRoot)
  mountedApps.push(app)

  function findTrigger() {
    const triggerButton = appRoot.querySelector('button')
    if (!triggerButton) throw new Error('The menu trigger is missing.')
    return triggerButton
  }

  return {
    ...menuEntryFixtures,
    isOpen,
    outsideElement,
    findTrigger,
    findPanel: () => document.querySelector<HTMLElement>('[role="menu"]'),
    findMenuItem: (itemLabel: string) =>
      [...document.querySelectorAll<HTMLElement>('[role^="menuitem"]')].find((menuItemElement) =>
        menuItemElement.textContent?.includes(itemLabel),
      ),
  }
}

async function flushVueUpdates() {
  for (let tickIndex = 0; tickIndex < 5; tickIndex++) await nextTick()
}

function pressKey(keyName: string, pressedElement: Element | null = document.activeElement) {
  pressedElement?.dispatchEvent(new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true }))
}

function clickWithPointer(clickedElement: Element) {
  clickedElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }))
}

async function openWithPointer(triggerButton: HTMLElement) {
  clickWithPointer(triggerButton)
  await flushVueUpdates()
}

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
})

describe('KMenu', () => {
  describe('trigger', () => {
    it('announces a closed menu button', () => {
      const { findTrigger, findPanel } = mountMenu()

      expect(findTrigger().getAttribute('aria-haspopup')).toBe('menu')
      expect(findTrigger().getAttribute('aria-expanded')).toBe('false')
      expect(findTrigger().textContent).toContain('Options')
      expect(findPanel()).toBeNull()
    })

    it('opens the menu, links it to the trigger and never announces a pressed state', async () => {
      const { findTrigger, findPanel, isOpen } = mountMenu()

      await openWithPointer(findTrigger())

      expect(isOpen.value).toBe(true)
      expect(findTrigger().getAttribute('aria-expanded')).toBe('true')
      expect(findTrigger().getAttribute('aria-controls')).toBe(findPanel()?.id)
      expect(findTrigger().hasAttribute('aria-pressed')).toBe(false)
      expect(findPanel()?.getAttribute('aria-label')).toBe('Options')
    })

    it('focuses the panel when opened with a pointer', async () => {
      const { findTrigger, findPanel } = mountMenu()

      await openWithPointer(findTrigger())

      expect(document.activeElement).toBe(findPanel())
    })

    it('focuses the first item when opened with Enter or Space', async () => {
      const { findTrigger, findMenuItem } = mountMenu()

      findTrigger().click()
      await flushVueUpdates()

      expect(document.activeElement).toBe(findMenuItem('Edit'))
    })

    it('opens on the first or last item with the arrow keys', async () => {
      const { findTrigger, findMenuItem } = mountMenu()

      pressKey('ArrowUp', findTrigger())
      await flushVueUpdates()

      expect(document.activeElement).toBe(findMenuItem('Delete'))

      pressKey('Escape')
      await flushVueUpdates()
      pressKey('ArrowDown', findTrigger())
      await flushVueUpdates()

      expect(document.activeElement).toBe(findMenuItem('Edit'))
    })

    it('closes the menu when clicked again', async () => {
      const { findTrigger, findPanel } = mountMenu()
      await openWithPointer(findTrigger())

      clickWithPointer(findTrigger())
      await flushVueUpdates()

      expect(findPanel()).toBeNull()
    })
  })

  describe('keyboard', () => {
    it('moves between enabled items with the arrow keys, skipping disabled ones and wrapping around', async () => {
      const { findTrigger, findMenuItem } = mountMenu()
      findTrigger().click()
      await flushVueUpdates()

      pressKey('ArrowDown')
      expect(document.activeElement).toBe(findMenuItem('Terms & policies'))

      pressKey('ArrowUp')
      pressKey('ArrowUp')
      expect(document.activeElement).toBe(findMenuItem('Delete'))
    })

    it('jumps to the first and last items with Home and End', async () => {
      const { findTrigger, findMenuItem } = mountMenu()
      findTrigger().click()
      await flushVueUpdates()

      pressKey('End')
      expect(document.activeElement).toBe(findMenuItem('Delete'))

      pressKey('Home')
      expect(document.activeElement).toBe(findMenuItem('Edit'))
    })

    it('closes with Escape and gives the focus back to the trigger', async () => {
      const { findTrigger, findPanel } = mountMenu()
      findTrigger().click()
      await flushVueUpdates()

      pressKey('Escape')
      await flushVueUpdates()

      expect(findPanel()).toBeNull()
      expect(document.activeElement).toBe(findTrigger())
    })

    it('closes with Tab and leaves the focus on the trigger so Tab moves on from there', async () => {
      const { findTrigger, findPanel } = mountMenu()
      findTrigger().click()
      await flushVueUpdates()

      pressKey('Tab')
      await flushVueUpdates()

      expect(findPanel()).toBeNull()
      expect(document.activeElement).toBe(findTrigger())
    })

    it('closes with Shift+Tab too, so the focus can move back from the trigger', async () => {
      const { findTrigger, findPanel } = mountMenu()
      findTrigger().click()
      await flushVueUpdates()

      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }),
      )
      await flushVueUpdates()

      expect(findPanel()).toBeNull()
      expect(document.activeElement).toBe(findTrigger())
    })

    it('selects the focused item with Enter, then closes and focuses the trigger', async () => {
      const { findTrigger, findPanel, selectEdit } = mountMenu()
      findTrigger().click()
      await flushVueUpdates()

      pressKey('Enter')
      await flushVueUpdates()

      expect(selectEdit).toHaveBeenCalledOnce()
      expect(findPanel()).toBeNull()
      expect(document.activeElement).toBe(findTrigger())
    })
  })

  describe('pointer', () => {
    it('highlights the item under the pointer by focusing it', async () => {
      const { findTrigger, findMenuItem } = mountMenu()
      await openWithPointer(findTrigger())

      findMenuItem('Delete')?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }))

      expect(document.activeElement).toBe(findMenuItem('Delete'))
    })

    it('never highlights a disabled item and clears the highlight when the pointer leaves', async () => {
      const { findTrigger, findPanel, findMenuItem } = mountMenu()
      await openWithPointer(findTrigger())
      findMenuItem('Edit')?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }))

      findMenuItem('Archived')?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }))
      expect(document.activeElement).toBe(findPanel())

      findMenuItem('Edit')?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }))
      findPanel()?.dispatchEvent(new PointerEvent('pointerleave'))
      expect(document.activeElement).toBe(findPanel())
    })

    it('closes when a pointer goes down outside', async () => {
      const { findTrigger, findPanel, outsideElement } = mountMenu()
      await openWithPointer(findTrigger())

      outsideElement.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      await flushVueUpdates()

      expect(findPanel()).toBeNull()
    })
  })

  describe('items', () => {
    it('keeps the menu open after toggling a checkbox item', async () => {
      const { findTrigger, findPanel, findMenuItem, togglePending } = mountMenu()
      await openWithPointer(findTrigger())

      clickWithPointer(findMenuItem('Pending') as HTMLElement)
      await flushVueUpdates()

      expect(togglePending).toHaveBeenCalledOnce()
      expect(findPanel()).not.toBeNull()
    })

    it('ignores clicks on a disabled item', async () => {
      const { findTrigger, findPanel, findMenuItem, selectArchived } = mountMenu()
      await openWithPointer(findTrigger())

      clickWithPointer(findMenuItem('Archived') as HTMLElement)
      await flushVueUpdates()

      expect(selectArchived).not.toHaveBeenCalled()
      expect(findPanel()).not.toBeNull()
    })

    it('renders the roles and states of each kind of entry', async () => {
      const { findTrigger, findPanel, findMenuItem } = mountMenu()
      await openWithPointer(findTrigger())

      expect(findPanel()?.querySelector('[role="separator"]')).not.toBeNull()
      expect(findPanel()?.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Show')
      expect(findPanel()?.textContent).toContain('avery.collins@example.com')
      expect(findMenuItem('Edit')?.getAttribute('role')).toBe('menuitem')
      expect(findMenuItem('Edit')?.textContent).toContain('⌘E')
      expect(findMenuItem('Archived')?.getAttribute('aria-disabled')).toBe('true')
      expect(findMenuItem('Pending')?.getAttribute('role')).toBe('menuitemcheckbox')
      expect(findMenuItem('Pending')?.getAttribute('aria-checked')).toBe('true')
      expect(findMenuItem('Transfers')?.getAttribute('aria-checked')).toBe('false')
    })

    it('renders a link item that opens an external page in a new tab', async () => {
      const { findTrigger, findMenuItem } = mountMenu()
      await openWithPointer(findTrigger())

      const termsLink = findMenuItem('Terms & policies')

      expect(termsLink?.tagName).toBe('A')
      expect(termsLink?.getAttribute('href')).toBe('https://example.com/terms')
      expect(termsLink?.getAttribute('target')).toBe('_blank')
      expect(termsLink?.textContent).toContain('(opens in a new tab)')
    })

    it('renders radio items with their role', async () => {
      const { findTrigger, findMenuItem } = mountMenu({
        items: [
          { label: 'Any time', type: 'radio', checked: true },
          { label: 'Today', type: 'radio' },
        ],
      })
      await openWithPointer(findTrigger())

      expect(findMenuItem('Any time')?.getAttribute('role')).toBe('menuitemradio')
      expect(findMenuItem('Any time')?.getAttribute('aria-checked')).toBe('true')
    })
  })
})
