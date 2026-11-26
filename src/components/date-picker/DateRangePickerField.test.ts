import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref, type App } from 'vue'
import { type DateRange, KDateRangePickerField } from '.'

vi.mock('../../shared/utils/isoDate', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../shared/utils/isoDate')>()),
  findLocalTodayIsoDate: () => '2026-11-26',
}))

const mountedApps: App[] = []

const reportShortcuts = [{ label: 'Last 7 days', value: ['2026-11-19', '2026-11-26'] }]

function mountDateRangePickerField(dateRangePickerFieldProps: Record<string, unknown> = {}) {
  const selectedRange = ref(dateRangePickerFieldProps.modelValue as DateRange | undefined)
  const appRoot = document.createElement('div')
  document.body.append(appRoot)

  const app = createApp({
    render: () =>
      h(KDateRangePickerField, {
        'label': 'Report period',
        ...dateRangePickerFieldProps,
        'modelValue': selectedRange.value,
        'onUpdate:modelValue': (nextRange: DateRange | undefined) => {
          selectedRange.value = nextRange
        },
      }),
  })
  app.mount(appRoot)
  mountedApps.push(app)

  function findTrigger() {
    const triggerElement = appRoot.querySelector<HTMLElement>('[aria-haspopup="dialog"]')
    if (!triggerElement) throw new Error('The date range picker field trigger is missing.')
    return triggerElement
  }

  return {
    selectedRange,
    findTrigger,
    findDay: (isoDate: string) => document.querySelector<HTMLButtonElement>(`[data-iso-date="${isoDate}"]`),
    findMonthLabels: () => [...document.querySelectorAll('[role="dialog"] p')].map((monthLabel) => monthLabel.textContent?.trim()),
  }
}

async function flushVueUpdates() {
  for (let tickIndex = 0; tickIndex < 5; tickIndex++) await nextTick()
}

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
})

describe('KDateRangePickerField', () => {
  it('shows the range, or the label of the matching shortcut', () => {
    expect(mountDateRangePickerField({ modelValue: ['2026-11-03', '2026-11-16'] }).findTrigger().textContent).toContain(
      '11/03/26 – 11/16/26',
    )
    expect(
      mountDateRangePickerField({ modelValue: ['2026-11-19', '2026-11-26'], shortcuts: reportShortcuts })
        .findTrigger()
        .textContent,
    ).toContain('Last 7 days')
  })

  it('picks a range on two months in two clicks', async () => {
    const dateRangePickerField = mountDateRangePickerField()

    dateRangePickerField.findTrigger().click()
    await flushVueUpdates()

    expect(dateRangePickerField.findMonthLabels()).toEqual(['November 2026', 'December 2026'])

    dateRangePickerField.findDay('2026-11-24')?.click()
    await flushVueUpdates()
    dateRangePickerField.findDay('2026-12-05')?.click()
    await flushVueUpdates()

    expect(dateRangePickerField.selectedRange.value).toEqual(['2026-11-24', '2026-12-05'])
  })

  it('types the range in one input labelled by the field label', async () => {
    const dateRangePickerField = mountDateRangePickerField({ editable: true, id: 'report-period' })
    const rangeInput = document.querySelector<HTMLInputElement>('input[role="combobox"]') as HTMLInputElement

    expect(rangeInput.id).toBe('report-period')
    expect(rangeInput.getAttribute('aria-labelledby')).toBe('report-period-label')

    rangeInput.focus()
    rangeInput.value = '1124202612052026'
    rangeInput.dispatchEvent(new InputEvent('input', { inputType: 'insertText', bubbles: true }))
    for (let tickIndex = 0; tickIndex < 5; tickIndex++) await nextTick()

    expect(rangeInput.value).toBe('11/24/2026 – 12/05/2026')
    expect(dateRangePickerField.selectedRange.value).toEqual(['2026-11-24', '2026-12-05'])
  })
})
