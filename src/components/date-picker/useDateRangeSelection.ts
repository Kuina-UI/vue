import { computed, type Ref, ref } from 'vue'
import type { DateRange } from '../../shared/types/calendar'
import type { DateFormatters } from '../../shared/utils/createDateFormatters'
import { addDaysToIsoDate, clampIsoDate, findLocalTodayIsoDate } from '../../shared/utils/isoDate'
import type { DateRangeProps, DateRangeShortcut } from './datePickerProps'

interface DateRangeSelectionProps extends DateRangeProps {
  placeholder?: string
  min?: string
  max?: string
  isDateDisabled?: (isoDate: string) => boolean
}

interface DateRangeSelectionOptions {
  dateFormatters: Ref<DateFormatters>
  fallbackPlaceholder?: string
  showDate: (isoDate: string) => void
}

/** Pick a range in two clicks with a live preview, from shortcuts, and describe it in the trigger. */
export function useDateRangeSelection(
  selectedRange: Ref<DateRange | undefined>,
  selectionProps: DateRangeSelectionProps,
  selectionOptions: DateRangeSelectionOptions,
) {
  const pendingRangeStart = ref<string>()
  const pendingRangeEnd = ref<string>()

  const hasSelection = computed(() => Boolean(selectedRange.value))

  const activeShortcut = computed(() => {
    const range = selectedRange.value
    if (!range) return undefined
    return selectionProps.shortcuts?.find(
      (shortcut) => shortcut.value[0] === range[0] && shortcut.value[1] === range[1],
    )
  })

  const selectionText = computed(() => {
    const range = selectedRange.value

    if (!range) return selectionProps.placeholder ?? selectionOptions.fallbackPlaceholder ?? ''
    if (selectionProps.selectionLabel) return selectionProps.selectionLabel(range, activeShortcut.value)
    if (activeShortcut.value) return activeShortcut.value.label

    const [rangeStart, rangeEnd] = range
    const { formatShortDate } = selectionOptions.dateFormatters.value

    return rangeStart === rangeEnd
      ? formatShortDate(rangeStart)
      : `${formatShortDate(rangeStart)} – ${formatShortDate(rangeEnd)}`
  })

  const displayedRange = computed<DateRange | undefined>(() => {
    if (pendingRangeStart.value) return [pendingRangeStart.value, pendingRangeEnd.value ?? pendingRangeStart.value]
    return selectedRange.value
  })

  const initialFocusedDate = computed(() =>
    clampIsoDate(selectedRange.value?.[0] ?? findLocalTodayIsoDate(), selectionProps.min, selectionProps.max),
  )

  function isDateDisabledDuringSelection(isoDate: string) {
    if (selectionProps.isDateDisabled?.(isoDate)) return true
    if (!pendingRangeStart.value || selectionProps.maxRangeDays === undefined) return false
    return isoDate > addDaysToIsoDate(pendingRangeStart.value, selectionProps.maxRangeDays - 1)
  }

  function forgetPendingRange() {
    pendingRangeStart.value = undefined
    pendingRangeEnd.value = undefined
  }

  /** Start a range on the first click, then end it on the second one, or restart it from an earlier date. */
  function selectRangeDate(isoDate: string) {
    const rangeStart = pendingRangeStart.value

    if (!rangeStart || isoDate < rangeStart) {
      pendingRangeStart.value = isoDate
      pendingRangeEnd.value = isoDate
      return
    }

    selectedRange.value = [rangeStart, isoDate]
    forgetPendingRange()
  }

  function previewRangeEnd(isoDate: string) {
    const rangeStart = pendingRangeStart.value
    if (rangeStart) pendingRangeEnd.value = isoDate < rangeStart ? rangeStart : isoDate
  }

  function resetRangePreview() {
    pendingRangeEnd.value = pendingRangeStart.value
  }

  function selectShortcut(shortcut: DateRangeShortcut) {
    selectedRange.value = [shortcut.value[0], shortcut.value[1]]
    forgetPendingRange()
    selectionOptions.showDate(shortcut.value[0])
  }

  return {
    hasSelection,
    activeShortcut,
    selectionText,
    displayedRange,
    initialFocusedDate,
    isDateDisabledDuringSelection,
    forgetPendingRange,
    selectRangeDate,
    previewRangeEnd,
    resetRangePreview,
    selectShortcut,
  }
}
