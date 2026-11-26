import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref, type App } from 'vue'
import { KSelectField } from '.'

const mountedApps: App[] = []

const countryOptions = [
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'mg', label: 'Madagascar', avatar: '/flags/madagascar.webp' },
]

function mountSelectField(selectFieldProps: Record<string, unknown> = {}) {
  const selectedValue = ref<unknown>(selectFieldProps.modelValue)
  const appRoot = document.createElement('div')
  document.body.append(appRoot)

  const app = createApp({
    render: () =>
      h(KSelectField, {
        'label': 'Country',
        'options': countryOptions,
        ...selectFieldProps,
        'modelValue': selectedValue.value,
        'onUpdate:modelValue': (nextValue: unknown) => {
          selectedValue.value = nextValue
        },
      }),
  })
  app.mount(appRoot)
  mountedApps.push(app)

  function findTrigger() {
    const triggerElement = appRoot.querySelector<HTMLElement>('[role="combobox"]')
    if (!triggerElement) throw new Error('The select field trigger is missing.')
    return triggerElement
  }

  return {
    appRoot,
    selectedValue,
    findTrigger,
    findLabel: () => document.getElementById(findTrigger().getAttribute('aria-labelledby') ?? ''),
    findOption: (optionLabel: string) =>
      [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((optionElement) =>
        optionElement.textContent?.includes(optionLabel),
      ),
  }
}

async function flushVueUpdates() {
  for (let tickIndex = 0; tickIndex < 5; tickIndex++) await nextTick()
}

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
})

describe('KSelectField', () => {
  it('names the combobox with its visible label', () => {
    const { findTrigger, findLabel } = mountSelectField()

    expect(findLabel()?.textContent).toBe('Country')
    expect(findTrigger().hasAttribute('aria-label')).toBe(false)
  })

  it('rests the label inside the empty field and floats it once a value is selected', async () => {
    const { findTrigger, findLabel, findOption } = mountSelectField()

    expect(findLabel()?.className).toContain('top-1/2')

    findTrigger().click()
    await flushVueUpdates()
    findOption('France')?.click()
    await flushVueUpdates()

    expect(findTrigger().textContent).toContain('France')
    expect(findLabel()?.className).toContain('top-0')
    expect(findLabel()?.className).not.toContain('top-1/2')
  })

  it('links the hint, or the error message instead, to the combobox', () => {
    const { findTrigger, appRoot } = mountSelectField({ id: 'country', hint: 'Where you pay taxes.' })

    expect(findTrigger().id).toBe('country')
    expect(findTrigger().getAttribute('aria-describedby')).toBe('country-hint')
    expect(appRoot.textContent).toContain('Where you pay taxes.')

    const invalidField = mountSelectField({ id: 'residence', hint: 'Where you pay taxes.', errorMessage: 'Choose a country.' })

    expect(invalidField.findTrigger().getAttribute('aria-describedby')).toBe('residence-error')
    expect(invalidField.findTrigger().getAttribute('aria-invalid')).toBe('true')
    expect(invalidField.appRoot.textContent).not.toContain('Where you pay taxes.')
  })

  it('shows the avatar of the selected option in the field', () => {
    const { findTrigger } = mountSelectField({ modelValue: 'mg' })

    expect(findTrigger().querySelector('img')?.getAttribute('src')).toBe('/flags/madagascar.webp')
  })

  it('shows its placeholder only once the label has moved up', () => {
    const { findTrigger } = mountSelectField({ placeholder: 'Choose your country' })

    const placeholderElement = [...findTrigger().querySelectorAll('span')].find(
      (spanElement) => spanElement.textContent?.trim() === 'Choose your country' && !spanElement.querySelector('span'),
    )

    expect(placeholderElement?.className).toContain('opacity-0')
    expect(placeholderElement?.className).toContain('group-focus-within:opacity-100')
  })

  it('keeps the label up and the placeholder visible when the label always floats', () => {
    const { findTrigger, findLabel } = mountSelectField({ placeholder: 'Choose your country', floatLabel: 'always' })

    const placeholderElement = [...findTrigger().querySelectorAll('span')].find(
      (spanElement) => spanElement.textContent?.trim() === 'Choose your country' && !spanElement.querySelector('span'),
    )

    expect(findLabel()?.className).toContain('top-0')
    expect(findLabel()?.className).not.toContain('top-1/2')
    expect(placeholderElement?.className).toContain('opacity-100')
    expect(placeholderElement?.className).not.toContain('opacity-0')
  })

  describe('search in the field', () => {
    function findSearchField(appRoot: HTMLElement) {
      const searchField = appRoot.querySelector<HTMLInputElement>('input[role="combobox"]')
      if (!searchField) throw new Error('The search field is missing.')
      return searchField
    }

    async function typeInSearchField(searchField: HTMLInputElement, typedQuery: string) {
      searchField.value = typedQuery
      searchField.dispatchEvent(new Event('input', { bubbles: true }))
      await flushVueUpdates()
    }

    it('turns the field into a combobox input and leaves the search bar out of the list', async () => {
      const { appRoot } = mountSelectField({ searchable: true, searchPlacement: 'field', modelValue: 'fr' })
      const searchField = findSearchField(appRoot)

      expect(searchField.value).toBe('France')
      expect(searchField.getAttribute('aria-autocomplete')).toBe('list')

      await typeInSearchField(searchField, 'mad')

      expect(searchField.getAttribute('aria-expanded')).toBe('true')
      expect(document.querySelector('input[type="search"]')).toBeNull()
      expect([...document.querySelectorAll('[role="option"]')].map((optionElement) => optionElement.textContent?.trim())).toEqual([
        'Madagascar',
      ])
    })

    it('never highlights the displayed label on focus, and starts a fresh search with the first typed letter', async () => {
      const { appRoot } = mountSelectField({ searchable: true, searchPlacement: 'field', modelValue: 'fr' })
      const searchField = findSearchField(appRoot)
      searchField.focus()
      await flushVueUpdates()

      expect(searchField.selectionEnd! - searchField.selectionStart!).toBe(0)

      const typedLetter = new KeyboardEvent('keydown', { key: 'm', bubbles: true, cancelable: true })
      searchField.dispatchEvent(typedLetter)
      await flushVueUpdates()

      expect(typedLetter.defaultPrevented).toBe(true)
      expect(searchField.value).toBe('m')
      expect(searchField.getAttribute('aria-expanded')).toBe('true')
      expect([...document.querySelectorAll('[role="option"]')].map((optionElement) => optionElement.textContent?.trim())).toEqual([
        'Madagascar',
      ])
    })

    it('selects the highlighted match with Enter and shows its label again', async () => {
      const { appRoot, selectedValue } = mountSelectField({ searchable: true, searchPlacement: 'field' })
      const searchField = findSearchField(appRoot)
      searchField.focus()

      await typeInSearchField(searchField, 'can')
      searchField.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
      await flushVueUpdates()

      expect(selectedValue.value).toBe('ca')
      expect(searchField.value).toBe('Canada')
      expect(searchField.getAttribute('aria-expanded')).toBe('false')
    })

    it('shows the selection again after each choice, and the next letter starts a new search', async () => {
      const { appRoot, selectedValue, findOption } = mountSelectField({
        searchable: true,
        searchPlacement: 'field',
        multiple: true,
        modelValue: [],
      })
      const searchField = findSearchField(appRoot)

      await typeInSearchField(searchField, 'fra')
      findOption('France')?.click()
      await flushVueUpdates()

      expect(selectedValue.value).toEqual(['fr'])
      expect(searchField.value).toBe('France')
      expect(searchField.getAttribute('aria-expanded')).toBe('true')

      searchField.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', bubbles: true, cancelable: true }))
      await flushVueUpdates()

      expect(searchField.value).toBe('c')
    })
  })

  it('never opens while disabled', async () => {
    const { findTrigger, findOption } = mountSelectField({ disabled: true })

    findTrigger().click()
    await flushVueUpdates()

    expect(findOption('France')).toBeUndefined()
    expect(findTrigger().getAttribute('tabindex')).toBe('-1')
  })
})
