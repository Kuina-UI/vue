import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref, type App, type Slots } from 'vue'
import { KDatePicker } from '.'

const mountedApps: App[] = []

function mountDatePicker(datePickerProps: Record<string, unknown> = {}, datePickerSlots: Partial<Slots> = {}) {
  const selectedDate = ref(datePickerProps.modelValue as string | undefined)
  const isOpen = ref(false)
  const appRoot = document.createElement('div')
  const outsideElement = document.createElement('button')
  document.body.append(appRoot, outsideElement)

  const app = createApp({
    render: () =>
      h(
        KDatePicker,
        {
          'label': 'Due date',
          ...datePickerProps,
          'modelValue': selectedDate.value,
          'onUpdate:modelValue': (nextDate: string | undefined) => {
            selectedDate.value = nextDate
          },
          'open': isOpen.value,
          'onUpdate:open': (nextOpenState: boolean) => {
            isOpen.value = nextOpenState
          },
        },
        datePickerSlots,
      ),
  })
  app.mount(appRoot)
  mountedApps.push(app)

  function findTrigger() {
    const triggerElement = appRoot.querySelector<HTMLElement>('[aria-haspopup="dialog"]')
    if (!triggerElement) throw new Error('The date picker trigger is missing.')
    return triggerElement
  }

  return {
    appRoot,
    selectedDate,
    isOpen,
    outsideElement,
    findTrigger,
    findDialog: () => document.querySelector<HTMLElement>('[role="dialog"]'),
    findDay: (isoDate: string) => document.querySelector<HTMLButtonElement>(`[data-iso-date="${isoDate}"]`),
    findMonthLabels: () => [...document.querySelectorAll('[role="dialog"] p')].map((monthLabel) => monthLabel.textContent?.trim()),
  }
}

async function flushVueUpdates() {
  for (let tickIndex = 0; tickIndex < 5; tickIndex++) await nextTick()
}

async function openDatePicker(datePicker: ReturnType<typeof mountDatePicker>) {
  datePicker.findTrigger().click()
  await flushVueUpdates()
}

vi.mock('../../shared/utils/isoDate', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../shared/utils/isoDate')>()),
  findLocalTodayIsoDate: () => '2026-11-26',
}))

function findTypedInputs() {
  return [...document.querySelectorAll<HTMLInputElement>('input[role="combobox"]')]
}

async function typeInInput(typedInput: HTMLInputElement, rawText: string, inputType = 'insertText') {
  typedInput.focus()
  typedInput.value = rawText
  typedInput.setSelectionRange(rawText.length, rawText.length)
  typedInput.dispatchEvent(new InputEvent('input', { inputType, bubbles: true }))
  for (let tickIndex = 0; tickIndex < 5; tickIndex++) await nextTick()
}

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
})

describe('KDatePicker', () => {
  it('shows the placeholder, then the selected date in the short format of the locale', () => {
    expect(mountDatePicker().findTrigger().textContent).toContain('Select date...')
    expect(mountDatePicker({ modelValue: '2026-11-26' }).findTrigger().textContent).toContain('11/26/26')
    expect(mountDatePicker({ modelValue: '2026-11-26', locale: 'fr-FR' }).findTrigger().textContent).toContain(
      '26/11/26',
    )
  })

  it('names its trigger with the label and the selected date', () => {
    const { findTrigger } = mountDatePicker({ modelValue: '2026-11-26' })

    expect(findTrigger().getAttribute('aria-label')).toBe('Due date, 11/26/26')
    expect(findTrigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('opens a calendar on the month of the selected date, with today marked', async () => {
    const datePicker = mountDatePicker({ modelValue: '2026-11-12' })
    await openDatePicker(datePicker)

    expect(datePicker.isOpen.value).toBe(true)
    expect(datePicker.findDialog()?.getAttribute('aria-label')).toBe('Due date')
    expect(datePicker.findMonthLabels()).toEqual(['November 2026'])
    expect(datePicker.findDay('2026-11-12')?.getAttribute('aria-pressed')).toBe('true')
    expect(datePicker.findDay('2026-11-26')?.getAttribute('aria-current')).toBe('date')
    expect(datePicker.findDay('2026-11-12')?.getAttribute('aria-label')).toBe('Thursday, November 12, 2026')
  })

  it('selects a day, closes the calendar and focuses the trigger again', async () => {
    const datePicker = mountDatePicker()
    await openDatePicker(datePicker)

    datePicker.findDay('2026-11-20')?.click()
    await flushVueUpdates()

    expect(datePicker.selectedDate.value).toBe('2026-11-20')
    expect(datePicker.isOpen.value).toBe(false)
    expect(document.activeElement).toBe(datePicker.findTrigger())
  })

  it('keeps the days outside min, max and isDateDisabled unselectable', async () => {
    const datePicker = mountDatePicker({
      min: '2026-11-10',
      max: '2026-11-25',
      isDateDisabled: (isoDate: string) => isoDate === '2026-11-14',
    })
    await openDatePicker(datePicker)

    expect(datePicker.findDay('2026-11-09')?.getAttribute('aria-disabled')).toBe('true')
    expect(datePicker.findDay('2026-11-14')?.getAttribute('aria-disabled')).toBe('true')
    expect(datePicker.findDay('2026-11-26')?.getAttribute('aria-disabled')).toBe('true')
    expect(datePicker.findDay('2026-11-12')?.hasAttribute('aria-disabled')).toBe(false)

    datePicker.findDay('2026-11-14')?.click()
    await flushVueUpdates()

    expect(datePicker.selectedDate.value).toBeUndefined()
  })

  it('keeps the listed dates and ranges unselectable', async () => {
    const datePicker = mountDatePicker({ disabledDates: ['2026-11-20', ['2026-11-24', '2026-11-27']] })
    await openDatePicker(datePicker)

    expect(datePicker.findDay('2026-11-20')?.getAttribute('aria-disabled')).toBe('true')
    expect(datePicker.findDay('2026-11-24')?.getAttribute('aria-disabled')).toBe('true')
    expect(datePicker.findDay('2026-11-27')?.getAttribute('aria-disabled')).toBe('true')
    expect(datePicker.findDay('2026-11-23')?.hasAttribute('aria-disabled')).toBe(false)
    expect(datePicker.findDay('2026-11-28')?.hasAttribute('aria-disabled')).toBe(false)

    datePicker.findDay('2026-11-25')?.click()
    await flushVueUpdates()

    expect(datePicker.selectedDate.value).toBeUndefined()
  })

  it('moves the focus between days and months with the keyboard', async () => {
    const datePicker = mountDatePicker({ modelValue: '2026-11-26' })
    await openDatePicker(datePicker)

    expect(document.activeElement).toBe(datePicker.findDay('2026-11-26'))

    datePicker.findDay('2026-11-26')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await flushVueUpdates()
    expect(document.activeElement).toBe(datePicker.findDay('2026-11-27'))

    datePicker.findDay('2026-11-27')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }))
    await flushVueUpdates()
    expect(document.activeElement).toBe(datePicker.findDay('2026-12-27'))
    expect(datePicker.findMonthLabels()).toContain('December 2026')
  })

  it('moves to the week edges with Home and End, and by a year with Shift and Page Down', async () => {
    const datePicker = mountDatePicker({ modelValue: '2026-11-26' })
    await openDatePicker(datePicker)

    function pressOnFocusedDay(keyboardEventInit: KeyboardEventInit) {
      document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { ...keyboardEventInit, bubbles: true }))
    }

    pressOnFocusedDay({ key: 'Home' })
    await flushVueUpdates()
    expect(document.activeElement).toBe(datePicker.findDay('2026-11-22'))

    pressOnFocusedDay({ key: 'End' })
    await flushVueUpdates()
    expect(document.activeElement).toBe(datePicker.findDay('2026-11-28'))

    pressOnFocusedDay({ key: 'PageDown', shiftKey: true })
    await flushVueUpdates()
    expect(document.activeElement).toBe(datePicker.findDay('2027-11-28'))
    expect(datePicker.findMonthLabels()).toEqual(['November 2027'])
  })

  it('closes on Escape and focuses the trigger', async () => {
    const datePicker = mountDatePicker()
    await openDatePicker(datePicker)

    datePicker.findDay('2026-11-26')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushVueUpdates()

    expect(datePicker.isOpen.value).toBe(false)
    expect(document.activeElement).toBe(datePicker.findTrigger())
  })

  it('takes every generated text from the locale, or from the label functions', async () => {
    const datePicker = mountDatePicker({
      modelValue: '2026-11-26',
      locale: 'fr-FR',
      weekStartsOn: 1,
      weekdayLabel: (weekday: number) => ['D', 'L', 'M', 'M', 'J', 'V', 'S'][weekday],
      selectionLabel: (selectedDate: string) => `Échéance : ${selectedDate}`,
    })
    await openDatePicker(datePicker)

    const weekdayLabels = [...document.querySelectorAll('[role="dialog"] [aria-hidden="true"] > div')].map(
      (weekdayLabel) => weekdayLabel.textContent?.trim(),
    )

    expect(weekdayLabels).toEqual(['L', 'M', 'M', 'J', 'V', 'S', 'D'])
    expect(datePicker.findMonthLabels()).toEqual(['novembre 2026'])
    expect(datePicker.findDay('2026-11-26')?.getAttribute('aria-label')).toBe('jeudi 26 novembre 2026')
    expect(datePicker.findTrigger().textContent).toContain('Échéance : 2026-11-26')
  })

  it('renders the selection slot with the selected date', () => {
    const { findTrigger } = mountDatePicker(
      { modelValue: '2026-11-26' },
      { selection: ({ selectedDate }: { selectedDate: string }) => [h('strong', `Due ${selectedDate}`)] },
    )

    expect(findTrigger().querySelector('strong')?.textContent).toBe('Due 2026-11-26')
  })

  it('clears the date with the clear button', async () => {
    const datePicker = mountDatePicker({ modelValue: '2026-11-26', clearable: true })

    datePicker.findTrigger().querySelector<HTMLButtonElement>('button[aria-label="Clear current value"]')?.click()
    await flushVueUpdates()

    expect(datePicker.selectedDate.value).toBeUndefined()
    expect(datePicker.isOpen.value).toBe(false)
  })

  it('sends the date with a form through a hidden input', () => {
    const { appRoot } = mountDatePicker({ modelValue: '2026-11-26', name: 'due-date' })

    expect(appRoot.querySelector<HTMLInputElement>('input[type="hidden"]')?.value).toBe('2026-11-26')
  })

  describe('typing', () => {
    it('types the date in the trigger with the mask of the locale', async () => {
      const datePicker = mountDatePicker({ editable: true })
      const [dateInput] = findTypedInputs()

      expect(dateInput.getAttribute('aria-label')).toBe('Due date')
      expect(dateInput.placeholder).toBe('MM/DD/YYYY')

      await typeInInput(dateInput, '11022026')

      expect(dateInput.value).toBe('11/02/2026')
      expect(datePicker.selectedDate.value).toBe('2026-11-02')
    })

    it('shows the selected date in the input with a four-digit year', () => {
      mountDatePicker({ editable: true, modelValue: '2026-11-26' })

      expect(findTypedInputs()[0].value).toBe('11/26/2026')
    })
  })
})
