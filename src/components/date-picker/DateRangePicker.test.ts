import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref, type App } from 'vue'
import { type DateRange, KDateRangePicker } from '.'

const mountedApps: App[] = []

const reportShortcuts = [
  { label: 'Today', value: ['2026-11-26', '2026-11-26'] },
  { label: 'Last 7 days', value: ['2026-11-19', '2026-11-26'] },
]

function mountDateRangePicker(dateRangePickerProps: Record<string, unknown> = {}) {
  const selectedRange = ref(dateRangePickerProps.modelValue as DateRange | undefined)
  const isOpen = ref(false)
  const appRoot = document.createElement('div')
  document.body.append(appRoot)

  const app = createApp({
    render: () =>
      h(KDateRangePicker, {
        'label': 'Report period',
        ...dateRangePickerProps,
        'modelValue': selectedRange.value,
        'onUpdate:modelValue': (nextRange: DateRange | undefined) => {
          selectedRange.value = nextRange
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
    if (!triggerElement) throw new Error('The date range picker trigger is missing.')
    return triggerElement
  }

  return {
    appRoot,
    selectedRange,
    isOpen,
    findTrigger,
    findDay: (isoDate: string) => document.querySelector<HTMLButtonElement>(`[data-iso-date="${isoDate}"]`),
    findShortcut: (shortcutLabel: string) =>
      [...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')].find(
        (shortcutButton) => shortcutButton.textContent?.trim() === shortcutLabel,
      ),
    findMonthLabels: () => [...document.querySelectorAll('[role="dialog"] p')].map((monthLabel) => monthLabel.textContent?.trim()),
  }
}

async function flushVueUpdates() {
  for (let tickIndex = 0; tickIndex < 5; tickIndex++) await nextTick()
}

async function openDateRangePicker(dateRangePicker: ReturnType<typeof mountDateRangePicker>) {
  dateRangePicker.findTrigger().click()
  await flushVueUpdates()
}

vi.mock('../../shared/utils/isoDate', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../shared/utils/isoDate')>()),
  findLocalTodayIsoDate: () => '2026-11-26',
}))

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
})

describe('KDateRangePicker', () => {
  it('shows the range, a single day, or the label of the matching shortcut', () => {
    expect(mountDateRangePicker().findTrigger().textContent).toContain('Select date range...')
    expect(mountDateRangePicker({ modelValue: ['2026-11-03', '2026-11-16'] }).findTrigger().textContent).toContain(
      '11/03/26 – 11/16/26',
    )
    expect(mountDateRangePicker({ modelValue: ['2026-11-12', '2026-11-12'] }).findTrigger().textContent).toContain(
      '11/12/26',
    )
    expect(
      mountDateRangePicker({ modelValue: ['2026-11-19', '2026-11-26'], shortcuts: reportShortcuts })
        .findTrigger()
        .textContent,
    ).toContain('Last 7 days')
  })

  it('shows two months, from the month of the range start', async () => {
    const dateRangePicker = mountDateRangePicker({ modelValue: ['2026-11-24', '2026-12-05'] })
    await openDateRangePicker(dateRangePicker)

    expect(dateRangePicker.findMonthLabels()).toEqual(['November 2026', 'December 2026'])
    expect(dateRangePicker.findDay('2026-11-24')?.getAttribute('aria-pressed')).toBe('true')
    expect(dateRangePicker.findDay('2026-12-05')?.getAttribute('aria-pressed')).toBe('true')
  })

  it('starts the range on the first click, previews it on hover and ends it on the second click', async () => {
    const dateRangePicker = mountDateRangePicker()
    await openDateRangePicker(dateRangePicker)

    dateRangePicker.findDay('2026-11-10')?.click()
    await flushVueUpdates()
    dateRangePicker.findDay('2026-11-14')?.dispatchEvent(new MouseEvent('mouseenter'))
    await flushVueUpdates()

    expect(dateRangePicker.selectedRange.value).toBeUndefined()
    expect(dateRangePicker.findDay('2026-11-14')?.getAttribute('aria-pressed')).toBe('true')

    dateRangePicker.findDay('2026-11-16')?.click()
    await flushVueUpdates()

    expect(dateRangePicker.selectedRange.value).toEqual(['2026-11-10', '2026-11-16'])
  })

  it('restarts the range when the second click is before the first one', async () => {
    const dateRangePicker = mountDateRangePicker()
    await openDateRangePicker(dateRangePicker)

    dateRangePicker.findDay('2026-11-10')?.click()
    await flushVueUpdates()
    dateRangePicker.findDay('2026-11-05')?.click()
    await flushVueUpdates()
    dateRangePicker.findDay('2026-11-08')?.click()
    await flushVueUpdates()

    expect(dateRangePicker.selectedRange.value).toEqual(['2026-11-05', '2026-11-08'])
  })

  it('keeps the listed dates unselectable as a start or an end', async () => {
    const dateRangePicker = mountDateRangePicker({ disabledDates: [['2026-11-14', '2026-11-15']] })
    await openDateRangePicker(dateRangePicker)

    expect(dateRangePicker.findDay('2026-11-14')?.getAttribute('aria-disabled')).toBe('true')

    dateRangePicker.findDay('2026-11-14')?.click()
    await flushVueUpdates()
    dateRangePicker.findDay('2026-11-10')?.click()
    await flushVueUpdates()
    dateRangePicker.findDay('2026-11-15')?.click()
    await flushVueUpdates()

    expect(dateRangePicker.selectedRange.value).toBeUndefined()
  })

  it('limits the length of the range with maxRangeDays', async () => {
    const dateRangePicker = mountDateRangePicker({ maxRangeDays: 7 })
    await openDateRangePicker(dateRangePicker)

    dateRangePicker.findDay('2026-11-10')?.click()
    await flushVueUpdates()

    expect(dateRangePicker.findDay('2026-11-16')?.hasAttribute('aria-disabled')).toBe(false)
    expect(dateRangePicker.findDay('2026-11-17')?.getAttribute('aria-disabled')).toBe('true')
  })

  it('selects a shortcut and marks it as active', async () => {
    const dateRangePicker = mountDateRangePicker({ shortcuts: reportShortcuts })
    await openDateRangePicker(dateRangePicker)

    dateRangePicker.findShortcut('Last 7 days')?.click()
    await flushVueUpdates()

    expect(dateRangePicker.selectedRange.value).toEqual(['2026-11-19', '2026-11-26'])
    expect(dateRangePicker.findShortcut('Last 7 days')?.getAttribute('aria-pressed')).toBe('true')
    expect(dateRangePicker.findTrigger().textContent).toContain('Last 7 days')
  })

  it('passes the range and the matching shortcut to selectionLabel', () => {
    const selectionLabel = vi.fn(() => 'This week')
    const { findTrigger } = mountDateRangePicker({
      modelValue: ['2026-11-19', '2026-11-26'],
      shortcuts: reportShortcuts,
      selectionLabel,
    })

    expect(findTrigger().textContent).toContain('This week')
    expect(selectionLabel).toHaveBeenCalledWith(['2026-11-19', '2026-11-26'], reportShortcuts[1])
  })

  it('sends both dates with a form through hidden inputs', () => {
    const { appRoot } = mountDateRangePicker({ modelValue: ['2026-11-03', '2026-11-16'], name: 'period' })

    expect([...appRoot.querySelectorAll<HTMLInputElement>('input[type="hidden"]')].map((hiddenInput) => hiddenInput.value)).toEqual([
      '2026-11-03',
      '2026-11-16',
    ])
  })
})
