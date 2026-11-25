import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref, type App, type Slots } from 'vue'
import { KSelect } from '.'

const mountedApps: App[] = []

const planOptions = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro', description: 'For growing teams' },
  { value: 'enterprise', label: 'Enterprise', disabled: true },
  { value: 'education', label: 'Education' },
]

function mountSelect(selectProps: Record<string, unknown> = {}, selectSlots: Partial<Slots> = {}) {
  const selectedValue = ref<unknown>(selectProps.modelValue)
  const isOpen = ref(false)
  const appRoot = document.createElement('div')
  const outsideElement = document.createElement('div')
  document.body.append(appRoot, outsideElement)

  const app = createApp({
    render: () =>
      h(
        KSelect,
        {
          'label': 'Plan',
          'options': planOptions,
          ...selectProps,
          'modelValue': selectedValue.value,
          'onUpdate:modelValue': (nextValue: unknown) => {
            selectedValue.value = nextValue
          },
          'open': isOpen.value,
          'onUpdate:open': (nextOpenState: boolean) => {
            isOpen.value = nextOpenState
          },
        },
        selectSlots,
      ),
  })
  app.mount(appRoot)
  mountedApps.push(app)

  function findTrigger() {
    const triggerElement = appRoot.querySelector<HTMLElement>('[role="combobox"]')
    if (!triggerElement) throw new Error('The select trigger is missing.')
    return triggerElement
  }

  return {
    appRoot,
    selectedValue,
    isOpen,
    outsideElement,
    findTrigger,
    findListbox: () => document.querySelector<HTMLElement>('[role="listbox"]'),
    findSearchInput: () => document.querySelector<HTMLInputElement>('input[type="search"]'),
    findOptions: () => [...document.querySelectorAll<HTMLElement>('[role="option"]')],
    findOption: (optionLabel: string) =>
      [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(
        (optionElement) => optionElement.textContent?.trim().startsWith(optionLabel),
      ),
  }
}

async function flushVueUpdates() {
  for (let tickIndex = 0; tickIndex < 5; tickIndex++) await nextTick()
}

function pressKey(keyName: string, pressedElement: Element | null = document.activeElement) {
  pressedElement?.dispatchEvent(new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true }))
}

async function openWithPointer(triggerElement: HTMLElement) {
  triggerElement.focus()
  triggerElement.click()
  await flushVueUpdates()
}

async function typeSearchQuery(searchInput: HTMLInputElement, searchQuery: string) {
  searchInput.value = searchQuery
  searchInput.dispatchEvent(new Event('input', { bubbles: true }))
  await flushVueUpdates()
}

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
})

describe('KSelect', () => {
  describe('trigger', () => {
    it('announces a closed combobox with its placeholder', () => {
      const { findTrigger, findListbox } = mountSelect()

      expect(findTrigger().getAttribute('aria-haspopup')).toBe('listbox')
      expect(findTrigger().getAttribute('aria-expanded')).toBe('false')
      expect(findTrigger().getAttribute('aria-label')).toBe('Plan')
      expect(findTrigger().textContent).toContain('Select...')
      expect(findListbox()).toBeNull()
    })

    it('opens a listbox linked to the trigger and closes it when clicked again', async () => {
      const { findTrigger, findListbox, isOpen } = mountSelect()

      await openWithPointer(findTrigger())

      expect(isOpen.value).toBe(true)
      expect(findTrigger().getAttribute('aria-expanded')).toBe('true')
      expect(findTrigger().getAttribute('aria-controls')).toBe(findListbox()?.id)
      expect(findListbox()?.getAttribute('aria-label')).toBe('Plan')

      findTrigger().click()
      await flushVueUpdates()

      expect(findListbox()).toBeNull()
    })

    it('shows the label of the selected option', () => {
      const { findTrigger } = mountSelect({ modelValue: 'pro' })

      expect(findTrigger().textContent).toContain('Pro')
      expect(findTrigger().textContent).not.toContain('Select...')
    })

    it('never opens while disabled or loading', async () => {
      const disabledSelect = mountSelect({ disabled: true })
      await openWithPointer(disabledSelect.findTrigger())

      expect(disabledSelect.findTrigger().getAttribute('tabindex')).toBe('-1')
      expect(disabledSelect.isOpen.value).toBe(false)

      const loadingSelect = mountSelect({ loading: true, loadingPlaceholder: 'Loading plans…' })
      await openWithPointer(loadingSelect.findTrigger())

      expect(loadingSelect.findTrigger().getAttribute('aria-busy')).toBe('true')
      expect(loadingSelect.findTrigger().textContent).toContain('Loading plans…')
      expect(loadingSelect.isOpen.value).toBe(false)
    })

    it('closes when the pointer goes down outside', async () => {
      const { findTrigger, findListbox, outsideElement } = mountSelect()
      await openWithPointer(findTrigger())

      outsideElement.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      await flushVueUpdates()

      expect(findListbox()).toBeNull()
    })
  })

  describe('single selection', () => {
    it('selects the clicked option, closes and gives the focus back to the trigger', async () => {
      const { findTrigger, findOption, findListbox, selectedValue } = mountSelect()
      await openWithPointer(findTrigger())

      findOption('Pro')?.click()
      await flushVueUpdates()

      expect(selectedValue.value).toBe('pro')
      expect(findListbox()).toBeNull()
      expect(document.activeElement).toBe(findTrigger())
    })

    it('keeps changing its value when given a model value without v-model', async () => {
      const appRoot = document.createElement('div')
      document.body.append(appRoot)
      const app = createApp({ render: () => h(KSelect, { label: 'Plan', options: planOptions, modelValue: 'free' }) })
      app.mount(appRoot)
      mountedApps.push(app)
      const triggerElement = appRoot.querySelector<HTMLElement>('[role="combobox"]')!

      await openWithPointer(triggerElement)
      document.querySelectorAll<HTMLElement>('[role="option"]')[1]?.click()
      await flushVueUpdates()

      expect(triggerElement.textContent).toContain('Pro')
    })

    it('marks the selected option and never selects a disabled one', async () => {
      const { findTrigger, findOption, selectedValue } = mountSelect({ modelValue: 'pro' })
      await openWithPointer(findTrigger())

      expect(findOption('Pro')?.getAttribute('aria-selected')).toBe('true')
      expect(findOption('Enterprise')?.getAttribute('aria-disabled')).toBe('true')

      findOption('Enterprise')?.click()
      await flushVueUpdates()

      expect(selectedValue.value).toBe('pro')
    })
  })

  describe('keyboard', () => {
    it('opens on the selected option and moves between enabled options, skipping disabled ones', async () => {
      const { findTrigger, findOption } = mountSelect({ modelValue: 'pro' })
      findTrigger().focus()

      pressKey('ArrowDown', findTrigger())
      await flushVueUpdates()

      expect(findTrigger().getAttribute('aria-activedescendant')).toBe(findOption('Pro')?.id)

      pressKey('ArrowDown')
      await flushVueUpdates()

      expect(findTrigger().getAttribute('aria-activedescendant')).toBe(findOption('Education')?.id)
    })

    it('selects the highlighted option with Enter', async () => {
      const { findTrigger, selectedValue } = mountSelect()
      findTrigger().focus()

      pressKey('Enter', findTrigger())
      await flushVueUpdates()
      pressKey('End')
      await flushVueUpdates()
      pressKey('Enter')
      await flushVueUpdates()

      expect(selectedValue.value).toBe('education')
    })

    it('highlights the option starting with the typed letter', async () => {
      const { findTrigger, findOption } = mountSelect()
      findTrigger().focus()

      pressKey('e', findTrigger())
      await flushVueUpdates()

      expect(findTrigger().getAttribute('aria-activedescendant')).toBe(findOption('Education')?.id)
    })

    it('closes with Escape and keeps the focus on the trigger', async () => {
      const { findTrigger, findListbox } = mountSelect()
      await openWithPointer(findTrigger())

      pressKey('Escape')
      await flushVueUpdates()

      expect(findListbox()).toBeNull()
      expect(document.activeElement).toBe(findTrigger())
    })
  })

  describe('multiple selection', () => {
    it('toggles options, stays open and lists the selected labels', async () => {
      const { findTrigger, findOption, findListbox, selectedValue } = mountSelect({ multiple: true, modelValue: [] })
      await openWithPointer(findTrigger())

      findOption('Free')?.click()
      await flushVueUpdates()
      findOption('Pro')?.click()
      await flushVueUpdates()

      expect(selectedValue.value).toEqual(['free', 'pro'])
      expect(findListbox()?.getAttribute('aria-multiselectable')).toBe('true')
      expect(findTrigger().textContent).toContain('Free, Pro')

      findOption('Free')?.click()
      await flushVueUpdates()

      expect(selectedValue.value).toEqual(['pro'])
    })

    it('treats the multiple attribute written without a value as true', async () => {
      const { findTrigger, findOption, selectedValue } = mountSelect({ multiple: '', modelValue: [] })
      await openWithPointer(findTrigger())

      findOption('Free')?.click()
      await flushVueUpdates()

      expect(selectedValue.value).toEqual(['free'])
    })

    it('shows the text of selectionLabel and still gives screen readers every label', () => {
      const { findTrigger } = mountSelect({
        multiple: true,
        modelValue: ['free', 'pro'],
        selectionLabel: (selectedPlans: unknown[]) => `${selectedPlans.length} plans`,
      })

      const visibleSelection = findTrigger().querySelector('[aria-hidden="true"]')

      expect(visibleSelection?.textContent).toContain('2 plans')
      expect(findTrigger().querySelector('.sr-only')?.textContent).toContain('Free, Pro')
    })

    it('submits one hidden input per selected value', () => {
      const { appRoot } = mountSelect({ multiple: true, modelValue: ['free', 'pro'], name: 'plans' })

      const submittedValues = [...appRoot.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="plans"]')].map(
        (hiddenInput) => hiddenInput.value,
      )

      expect(submittedValues).toEqual(['free', 'pro'])
    })
  })

  describe('search', () => {
    it('focuses the search input, filters the options and announces when nothing matches', async () => {
      const { findTrigger, findSearchInput, findOptions } = mountSelect({
        searchable: true,
        noResultsLabel: (searchQuery: string) => `Nothing for ${searchQuery}`,
      })
      await openWithPointer(findTrigger())

      expect(document.activeElement).toBe(findSearchInput())

      await typeSearchQuery(findSearchInput()!, 'pro')

      expect(findOptions().map((optionElement) => optionElement.textContent?.trim())).toEqual([
        'ProFor growing teams',
      ])
      expect(findSearchInput()?.getAttribute('aria-activedescendant')).toBe(findOptions()[0]?.id)

      await typeSearchQuery(findSearchInput()!, 'zzz')

      expect(findOptions()).toHaveLength(0)
      expect(document.body.textContent).toContain('Nothing for zzz')
    })

    it('selects the first match with Enter from the search input', async () => {
      const { findTrigger, findSearchInput, selectedValue } = mountSelect({ searchable: true })
      await openWithPointer(findTrigger())
      await typeSearchQuery(findSearchInput()!, 'edu')

      pressKey('Enter', findSearchInput())
      await flushVueUpdates()

      expect(selectedValue.value).toBe('education')
    })
  })

  describe('search in the select', () => {
    function findSearchTrigger(appRoot: HTMLElement) {
      const searchTrigger = appRoot.querySelector<HTMLInputElement>('input[role="combobox"]')
      if (!searchTrigger) throw new Error('The search trigger is missing.')
      return searchTrigger
    }

    it('names the input, shows the placeholder, then the search placeholder once open', async () => {
      const { appRoot } = mountSelect({ searchable: true, searchPlacement: 'field', searchPlaceholder: 'Search plans' })
      const searchTrigger = findSearchTrigger(appRoot)

      expect(searchTrigger.getAttribute('aria-label')).toBe('Plan')
      expect(searchTrigger.placeholder).toBe('Select...')

      searchTrigger.closest('div')?.click()
      await flushVueUpdates()

      expect(searchTrigger.getAttribute('aria-expanded')).toBe('true')
      expect(searchTrigger.placeholder).toBe('Search plans')
      expect(document.activeElement).toBe(searchTrigger)
      expect(document.querySelector('input[type="search"]')).toBeNull()
    })

    it('opens on click without emptying the select, and Backspace starts an empty search', async () => {
      const { appRoot, findOptions } = mountSelect({ searchable: true, searchPlacement: 'field', modelValue: 'free' })
      const searchTrigger = findSearchTrigger(appRoot)

      searchTrigger.click()
      await flushVueUpdates()

      expect(searchTrigger.getAttribute('aria-expanded')).toBe('true')
      expect(searchTrigger.value).toBe('Free')
      expect(findOptions()).toHaveLength(planOptions.length)

      pressKey('Backspace', searchTrigger)
      await flushVueUpdates()

      expect(searchTrigger.value).toBe('')
      expect(searchTrigger.placeholder).toBe('Free')
    })

    it('starts a fresh search with the first typed letter, filters and selects with Enter', async () => {
      const { appRoot, findOptions, selectedValue } = mountSelect({ searchable: true, searchPlacement: 'field', modelValue: 'free' })
      const searchTrigger = findSearchTrigger(appRoot)
      searchTrigger.focus()

      expect(searchTrigger.value).toBe('Free')

      pressKey('e', searchTrigger)
      await flushVueUpdates()

      expect(searchTrigger.value).toBe('e')
      expect(findOptions().map((optionElement) => optionElement.textContent?.trim())).toEqual([
        'Free',
        'Enterprise',
        'Education',
      ])

      await typeSearchQuery(searchTrigger, 'edu')
      pressKey('Enter', searchTrigger)
      await flushVueUpdates()

      expect(selectedValue.value).toBe('education')
      expect(searchTrigger.value).toBe('Education')
    })
  })

  describe('clear button', () => {
    it('clears the selection without opening the listbox', async () => {
      const { findTrigger, findListbox, selectedValue } = mountSelect({ modelValue: 'pro', clearable: true })

      findTrigger().querySelector<HTMLButtonElement>('button[aria-label="Clear current value"]')?.click()
      await flushVueUpdates()

      expect(selectedValue.value).toBeUndefined()
      expect(findListbox()).toBeNull()
    })
  })

  describe('raw options', () => {
    it('reads values, labels and avatars through the given keys', async () => {
      const users = [
        { id: 1, fullName: 'Avery Collins', photoUrl: '/avery.webp' },
        { id: 2, fullName: 'Jordan Reyes', photoUrl: '/jordan.webp' },
      ]
      const { findTrigger, findOption, selectedValue } = mountSelect({
        label: 'Assignee',
        options: users,
        valueKey: 'id',
        labelKey: 'fullName',
        avatarKey: 'photoUrl',
      })
      await openWithPointer(findTrigger())

      expect(findOption('Jordan Reyes')?.querySelector('img')?.getAttribute('src')).toBe('/jordan.webp')

      findOption('Jordan Reyes')?.click()
      await flushVueUpdates()

      expect(selectedValue.value).toBe(2)
      expect(findTrigger().querySelector('img')?.getAttribute('src')).toBe('/jordan.webp')
    })

    it('leaves the avatar out of triggers too small for it', () => {
      const { findTrigger } = mountSelect({
        size: 'sm',
        modelValue: 'avery',
        options: [{ value: 'avery', label: 'Avery Collins', avatar: '/avery.webp' }],
      })

      expect(findTrigger().querySelector('img')).toBeNull()
    })
  })

  describe('actions', () => {
    it('reaches the actions after the options with the keyboard, runs one with Enter, then closes', async () => {
      const linkAccount = vi.fn()
      const { findTrigger, findListbox } = mountSelect({ actions: [{ label: 'Link an account', onSelect: linkAccount }] })
      await openWithPointer(findTrigger())

      pressKey('End')
      await flushVueUpdates()

      expect(findTrigger().getAttribute('aria-activedescendant')).toBe(
        document.querySelector('button[tabindex="-1"]')?.id,
      )

      pressKey('Enter')
      await flushVueUpdates()

      expect(linkAccount).toHaveBeenCalledOnce()
      expect(findListbox()).toBeNull()
    })
  })
})
