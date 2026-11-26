import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref, type App } from 'vue'
import { KDatePickerField } from '.'

vi.mock('../../shared/utils/isoDate', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../shared/utils/isoDate')>()),
  findLocalTodayIsoDate: () => '2026-11-26',
}))

const mountedApps: App[] = []

function mountDatePickerField(datePickerFieldProps: Record<string, unknown> = {}) {
  const selectedDate = ref(datePickerFieldProps.modelValue as string | undefined)
  const isOpen = ref(false)
  const appRoot = document.createElement('div')
  document.body.append(appRoot)

  const app = createApp({
    render: () =>
      h(KDatePickerField, {
        'label': 'Due date',
        ...datePickerFieldProps,
        'modelValue': selectedDate.value,
        'onUpdate:modelValue': (nextDate: string | undefined) => {
          selectedDate.value = nextDate
        },
        'open': isOpen.value,
        'onUpdate:open': (nextOpenState: boolean) => {
          isOpen.value = nextOpenState
        },
      }),
  })
  app.mount(appRoot)
  mountedApps.push(app)

  function findTrigger() {
    const triggerElement = appRoot.querySelector<HTMLElement>('[aria-haspopup="dialog"]')
    if (!triggerElement) throw new Error('The date picker field trigger is missing.')
    return triggerElement
  }

  function findLabel() {
    const [labelId] = (findTrigger().getAttribute('aria-labelledby') ?? '').split(' ')
    return document.getElementById(labelId)
  }

  return {
    appRoot,
    selectedDate,
    isOpen,
    findTrigger,
    findLabel,
    findDay: (isoDate: string) => document.querySelector<HTMLButtonElement>(`[data-iso-date="${isoDate}"]`),
  }
}

async function flushVueUpdates() {
  for (let tickIndex = 0; tickIndex < 5; tickIndex++) await nextTick()
}

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
})

describe('KDatePickerField', () => {
  it('shows its label inside the empty field, and floats it once a date is selected', async () => {
    const datePickerField = mountDatePickerField()

    expect(datePickerField.findLabel()?.textContent).toBe('Due date')
    expect(datePickerField.findLabel()?.className).toContain('top-1/2')

    datePickerField.findTrigger().click()
    await flushVueUpdates()
    datePickerField.findDay('2026-11-20')?.click()
    await flushVueUpdates()

    expect(datePickerField.selectedDate.value).toBe('2026-11-20')
    expect(datePickerField.findLabel()?.className).toContain('top-0')
    expect(datePickerField.findTrigger().textContent).toContain('11/20/26')
  })

  it('names its trigger with the label and the selected date', () => {
    const { findTrigger } = mountDatePickerField({ id: 'due-date', modelValue: '2026-11-26' })

    expect(findTrigger().id).toBe('due-date')
    expect(findTrigger().getAttribute('aria-labelledby')).toBe('due-date-label due-date-value')
    expect(document.getElementById('due-date-value')?.textContent).toContain('11/26/26')
  })

  it('links the hint, or the error message instead, to its trigger', () => {
    const { findTrigger, appRoot } = mountDatePickerField({ id: 'due-date', hint: 'Payments after this date are late.' })

    expect(findTrigger().getAttribute('aria-describedby')).toBe('due-date-hint')
    expect(appRoot.textContent).toContain('Payments after this date are late.')

    const invalidField = mountDatePickerField({ id: 'start-date', errorMessage: 'Choose a date after today.' })

    expect(invalidField.findTrigger().getAttribute('aria-describedby')).toBe('start-date-error')
    expect(invalidField.findTrigger().getAttribute('aria-invalid')).toBe('true')
  })

  it('keeps the label up and the placeholder visible when the label always floats', () => {
    const { findLabel, findTrigger } = mountDatePickerField({ placeholder: 'Pick a due date', floatLabel: 'always' })

    const placeholderElement = [...findTrigger().querySelectorAll('span')].find(
      (spanElement) => spanElement.textContent?.trim() === 'Pick a due date' && !spanElement.querySelector('span'),
    )

    expect(findLabel()?.className).toContain('top-0')
    expect(placeholderElement?.className).toContain('opacity-100')
  })

  describe('typing', () => {
    function findDateInput() {
      const dateInput = document.querySelector<HTMLInputElement>('input[role="combobox"]')
      if (!dateInput) throw new Error('The date input is missing.')
      return dateInput
    }

    async function typeInDateInput(rawText: string, inputType = 'insertText') {
      const dateInput = findDateInput()
      dateInput.value = rawText
      dateInput.setSelectionRange(rawText.length, rawText.length)
      dateInput.dispatchEvent(new InputEvent('input', { inputType, bubbles: true }))
      await flushVueUpdates()
    }

    it('adds the separators while typing and updates the date once it is complete', async () => {
      const datePickerField = mountDatePickerField({ editable: true })

      expect(findDateInput().placeholder).toBe('MM/DD/YYYY')

      await typeInDateInput('11')
      expect(findDateInput().value).toBe('11/')

      await typeInDateInput('11/02')
      expect(findDateInput().value).toBe('11/02/')
      expect(datePickerField.selectedDate.value).toBeUndefined()

      await typeInDateInput('11/02/2026')
      expect(findDateInput().value).toBe('11/02/2026')
      expect(datePickerField.selectedDate.value).toBe('2026-11-02')
    })

    it('lets Backspace go past a separator', async () => {
      mountDatePickerField({ editable: true })

      await typeInDateInput('11/')
      await typeInDateInput('11', 'deleteContentBackward')

      expect(findDateInput().value).toBe('11')
    })

    it('marks an impossible or unavailable date as invalid, then restores the last date when the focus leaves', async () => {
      const datePickerField = mountDatePickerField({ editable: true, modelValue: '2026-11-02', max: '2026-12-31' })

      await typeInDateInput('02/30/2026')
      expect(findDateInput().getAttribute('aria-invalid')).toBe('true')
      expect(datePickerField.selectedDate.value).toBe('2026-11-02')

      await typeInDateInput('01/15/2027')
      expect(findDateInput().getAttribute('aria-invalid')).toBe('true')

      findDateInput().dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
      await flushVueUpdates()

      expect(findDateInput().value).toBe('11/02/2026')
      expect(findDateInput().hasAttribute('aria-invalid')).toBe(false)
    })

    it('reads a pasted date and follows the order of the locale', async () => {
      const datePickerField = mountDatePickerField({ editable: true, locale: 'fr-FR' })

      expect(findDateInput().placeholder).toBe('DD/MM/YYYY')

      await typeInDateInput('2026-11-02', 'insertFromPaste')
      expect(findDateInput().value).toBe('02/11/2026')
      expect(datePickerField.selectedDate.value).toBe('2026-11-02')
    })

    it('clears the date when the text is erased', async () => {
      const datePickerField = mountDatePickerField({ editable: true, modelValue: '2026-11-02' })

      await typeInDateInput('', 'deleteContentBackward')

      expect(datePickerField.selectedDate.value).toBeUndefined()
    })

    it('opens the calendar without leaving the input on click, and moves into it with the down arrow', async () => {
      const datePickerField = mountDatePickerField({ editable: true, modelValue: '2026-11-02' })

      findDateInput().click()
      await flushVueUpdates()

      expect(datePickerField.isOpen.value).toBe(true)
      expect(document.activeElement).toBe(findDateInput())

      findDateInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
      await flushVueUpdates()

      expect(document.activeElement).toBe(datePickerField.findDay('2026-11-02'))
    })
  })

  it('keeps the listed dates unselectable', async () => {
    const datePickerField = mountDatePickerField({ disabledDates: [['2026-11-24', '2026-11-27']] })

    datePickerField.findTrigger().click()
    await flushVueUpdates()

    expect(datePickerField.findDay('2026-11-25')?.getAttribute('aria-disabled')).toBe('true')
    expect(datePickerField.findDay('2026-11-23')?.hasAttribute('aria-disabled')).toBe(false)
  })
})
