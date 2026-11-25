import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref, type App, type Slots } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import { KMenu, type MenuEntry, type MenuProps } from '.'

const mountedApps: App[] = []

function createMenuEntries() {
  const selectEdit = vi.fn()
  const selectArchived = vi.fn()
  const togglePending = vi.fn()

  const menuEntries: MenuEntry[] = [
    { label: 'Avery Collins', description: 'avery.collins@example.com', readOnly: true },
    { separator: true },
    { label: 'Edit', shortcut: 'mod+e', onSelect: selectEdit },
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

function mountMenu(menuProps: Partial<MenuProps> = {}, menuSlots: Partial<Slots> = {}) {
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
      }, menuSlots),
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
    findPanels: () => [...document.querySelectorAll<HTMLElement>('[role="menu"]')],
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

const originalPlatformDescriptor = Object.getOwnPropertyDescriptor(navigator, 'platform')

beforeEach(() => {
  Object.defineProperty(navigator, 'platform', { value: 'Win32', configurable: true })
})

afterEach(() => {
  if (originalPlatformDescriptor) Object.defineProperty(navigator, 'platform', originalPlatformDescriptor)
  else Reflect.deleteProperty(navigator, 'platform')
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
      expect(findMenuItem('Edit')?.textContent).toContain('Ctrl+E')
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

  describe('custom trigger', () => {
    it('renders the trigger slot and wires it to the menu', async () => {
      const { findPanel } = mountMenu(
        {},
        {
          trigger: ({ triggerAttributes }: { triggerAttributes: Record<string, unknown> }) => [
            h('button', { id: 'profile-trigger', ...triggerAttributes }, 'Avery Collins'),
          ],
        },
      )
      const profileTrigger = document.getElementById('profile-trigger') as HTMLElement

      expect(profileTrigger.getAttribute('aria-haspopup')).toBe('menu')

      await openWithPointer(profileTrigger)

      expect(findPanel()).not.toBeNull()
      expect(profileTrigger.getAttribute('aria-expanded')).toBe('true')

      pressKey('Escape')
      await flushVueUpdates()

      expect(document.activeElement).toBe(profileTrigger)
    })
  })

  describe('positioning', () => {
    function placeTriggerNearTheBottom() {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 700, 120, 32))
      vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(200)
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(224)
      Object.defineProperty(document.documentElement, 'clientHeight', { value: 800, configurable: true })
    }

    afterEach(() => {
      vi.restoreAllMocks()
      Reflect.deleteProperty(document.documentElement, 'clientHeight')
    })

    it('uses fixed positioning when asked, for a menu inside a fixed or sticky area', async () => {
      const { findTrigger, findPanel } = mountMenu({ strategy: 'fixed' })

      await openWithPointer(findTrigger())

      expect(findPanel()?.style.position).toBe('fixed')
    })

    it('opens above its trigger when there is no room below', async () => {
      placeTriggerNearTheBottom()
      const { findTrigger, findPanel } = mountMenu()

      await openWithPointer(findTrigger())

      expect(findPanel()?.className).toContain('origin-bottom-left')
    })

    it('keeps the requested side when flip is turned off', async () => {
      placeTriggerNearTheBottom()
      const { findTrigger, findPanel } = mountMenu({ flip: false })

      await openWithPointer(findTrigger())

      expect(findPanel()?.className).toContain('origin-top-left')
    })
  })

  describe('typeahead', () => {
    it('moves to the next item starting with the typed letter', async () => {
      const { findTrigger, findMenuItem } = mountMenu()
      findTrigger().click()
      await flushVueUpdates()

      pressKey('d')

      expect(document.activeElement).toBe(findMenuItem('Delete'))
    })

    it('cycles through items starting with the same letter when it is typed again', async () => {
      const { findTrigger, findMenuItem } = mountMenu()
      findTrigger().click()
      await flushVueUpdates()

      pressKey('t')
      expect(document.activeElement).toBe(findMenuItem('Terms & policies'))

      pressKey('t')
      expect(document.activeElement).toBe(findMenuItem('Transfers'))
    })
  })

  describe('submenus', () => {
    function createSubmenuEntries() {
      const selectBusiness = vi.fn()
      const menuEntries: MenuEntry[] = [
        { label: 'Edit' },
        { label: 'Move to', submenu: [{ label: 'Household' }, { label: 'Business', onSelect: selectBusiness }] },
        { label: 'Delete', color: 'danger' },
      ]

      return { menuEntries, selectBusiness }
    }

    async function openOnMoveTo() {
      const { menuEntries, selectBusiness } = createSubmenuEntries()
      const mountedMenu = mountMenu({ items: menuEntries })
      mountedMenu.findTrigger().click()
      await flushVueUpdates()
      pressKey('ArrowDown')

      return { ...mountedMenu, selectBusiness }
    }

    function pointTo(pointedElement: Element | undefined | null) {
      pointedElement?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }))
    }

    afterEach(() => {
      vi.useRealTimers()
    })

    it('announces an item that opens a submenu', async () => {
      const { findMenuItem } = await openOnMoveTo()

      expect(findMenuItem('Move to')?.getAttribute('aria-haspopup')).toBe('menu')
      expect(findMenuItem('Move to')?.getAttribute('aria-expanded')).toBe('false')
    })

    it('opens the submenu on its first item with the right arrow', async () => {
      const { findMenuItem, findPanels } = await openOnMoveTo()

      pressKey('ArrowRight')
      await flushVueUpdates()

      const submenuPanel = findPanels()[1]
      expect(submenuPanel?.getAttribute('aria-label')).toBe('Move to')
      expect(findMenuItem('Move to')?.getAttribute('aria-expanded')).toBe('true')
      expect(findMenuItem('Move to')?.getAttribute('aria-controls')).toBe(submenuPanel?.id)
      expect(document.activeElement).toBe(findMenuItem('Household'))
    })

    it('opens the submenu on its first item with Enter', async () => {
      const { findMenuItem } = await openOnMoveTo()

      pressKey('Enter')
      await flushVueUpdates()

      expect(document.activeElement).toBe(findMenuItem('Household'))
    })

    it('closes only the submenu with the left arrow or Escape, back on its item', async () => {
      const { findMenuItem, findPanels } = await openOnMoveTo()

      for (const closingKey of ['ArrowLeft', 'Escape']) {
        pressKey('ArrowRight')
        await flushVueUpdates()
        pressKey(closingKey)
        await flushVueUpdates()

        expect(findPanels()).toHaveLength(1)
        expect(document.activeElement).toBe(findMenuItem('Move to'))
      }
    })

    it('opens the submenu on hover without moving the focus into it', async () => {
      const { findMenuItem, findPanels } = await openOnMoveTo()

      pointTo(findMenuItem('Move to'))
      await flushVueUpdates()

      expect(findPanels()).toHaveLength(2)
      expect(document.activeElement).toBe(findMenuItem('Move to'))
    })

    it('closes the submenu shortly after another item is hovered, unless the pointer reaches the submenu', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      const { findMenuItem, findPanels } = await openOnMoveTo()

      pointTo(findMenuItem('Move to'))
      await flushVueUpdates()
      pointTo(findMenuItem('Delete'))
      findPanels()[1]?.dispatchEvent(new PointerEvent('pointerenter'))
      vi.advanceTimersByTime(200)
      await flushVueUpdates()

      expect(findPanels()).toHaveLength(2)

      pointTo(findMenuItem('Delete'))
      vi.advanceTimersByTime(200)
      await flushVueUpdates()

      expect(findPanels()).toHaveLength(1)
    })

    it('selects an item of the submenu, then closes the whole menu', async () => {
      const { findTrigger, findPanels, selectBusiness } = await openOnMoveTo()

      pressKey('ArrowRight')
      await flushVueUpdates()
      pressKey('ArrowDown')
      pressKey('Enter')
      await flushVueUpdates()

      expect(selectBusiness).toHaveBeenCalledOnce()
      expect(findPanels()).toHaveLength(0)
      expect(document.activeElement).toBe(findTrigger())
    })

    it('stays open when a pointer goes down in the submenu', async () => {
      const { findMenuItem, findPanels } = await openOnMoveTo()
      pressKey('ArrowRight')
      await flushVueUpdates()

      findMenuItem('Household')?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      await flushVueUpdates()

      expect(findPanels()).toHaveLength(2)
    })
  })

  describe('item actions', () => {
    function createReportEntries() {
      const openReport = vi.fn()
      const renameReport = vi.fn()
      const deleteReport = vi.fn()
      const menuEntries: MenuEntry[] = [
        {
          label: 'Monthly spending',
          onSelect: openReport,
          actions: [
            { label: 'Rename report', icon: Pencil, onSelect: renameReport },
            { label: 'Delete report', icon: Trash2, onSelect: deleteReport },
          ],
        },
        { label: 'Subscriptions audit' },
      ]

      return { menuEntries, openReport, deleteReport }
    }

    function findActionButton(actionLabel: string) {
      return document.querySelector<HTMLElement>(`button[aria-label="${actionLabel}"]`)
    }

    it('renders each action as a button named for screen readers, out of the tab order', async () => {
      const { menuEntries } = createReportEntries()
      const { findTrigger } = mountMenu({ items: menuEntries })
      await openWithPointer(findTrigger())

      expect(findActionButton('Delete report')?.getAttribute('tabindex')).toBe('-1')
    })

    it('moves between the item and its actions with the left and right arrows', async () => {
      const { menuEntries } = createReportEntries()
      const { findTrigger, findMenuItem } = mountMenu({ items: menuEntries })
      findTrigger().click()
      await flushVueUpdates()

      pressKey('ArrowRight')
      expect(document.activeElement).toBe(findActionButton('Rename report'))

      pressKey('ArrowRight')
      expect(document.activeElement).toBe(findActionButton('Delete report'))

      pressKey('ArrowLeft')
      pressKey('ArrowLeft')
      expect(document.activeElement).toBe(findMenuItem('Monthly spending'))
    })

    it('runs the action instead of the item, then closes the menu', async () => {
      const { menuEntries, openReport, deleteReport } = createReportEntries()
      const { findTrigger, findPanel } = mountMenu({ items: menuEntries })
      await openWithPointer(findTrigger())

      clickWithPointer(findActionButton('Delete report') as HTMLElement)
      await flushVueUpdates()

      expect(deleteReport).toHaveBeenCalledOnce()
      expect(openReport).not.toHaveBeenCalled()
      expect(findPanel()).toBeNull()
    })

    it('lets Enter press the focused action button natively', async () => {
      const { menuEntries } = createReportEntries()
      const { findTrigger } = mountMenu({ items: menuEntries })
      findTrigger().click()
      await flushVueUpdates()
      pressKey('ArrowRight')

      const enterKeydown = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
      document.activeElement?.dispatchEvent(enterKeydown)

      expect(enterKeydown.defaultPrevented).toBe(false)
    })
  })

  describe('item shortcuts', () => {
    it('shows each shortcut the way the platform of the user writes it', async () => {
      Object.defineProperty(navigator, 'platform', { value: 'MacIntel', configurable: true })
      const { findTrigger, findMenuItem } = mountMenu()
      await flushVueUpdates()

      await openWithPointer(findTrigger())

      expect(findMenuItem('Edit')?.textContent).toContain('⌘E')
    })
  })
})
