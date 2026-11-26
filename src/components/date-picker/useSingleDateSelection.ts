import { computed, type Ref } from 'vue'
import type { DateFormatters } from '../../shared/utils/createDateFormatters'
import { clampIsoDate, findLocalTodayIsoDate } from '../../shared/utils/isoDate'
import type { SingleDateProps } from './datePickerProps'

interface SingleDateSelectionProps extends SingleDateProps {
  placeholder?: string
  min?: string
  max?: string
}

/** Describe the date a date picker holds: the text its trigger shows and the day its calendar opens on. */
export function useSingleDateSelection(
  selectedDate: Ref<string | undefined>,
  selectionProps: SingleDateSelectionProps,
  dateFormatters: Ref<DateFormatters>,
  fallbackPlaceholder = '',
) {
  const hasSelection = computed(() => Boolean(selectedDate.value))

  const selectionText = computed(() => {
    if (!selectedDate.value) return selectionProps.placeholder ?? fallbackPlaceholder
    return selectionProps.selectionLabel
      ? selectionProps.selectionLabel(selectedDate.value)
      : dateFormatters.value.formatShortDate(selectedDate.value)
  })

  const initialFocusedDate = computed(() =>
    clampIsoDate(selectedDate.value ?? findLocalTodayIsoDate(), selectionProps.min, selectionProps.max),
  )

  return { hasSelection, selectionText, initialFocusedDate }
}
