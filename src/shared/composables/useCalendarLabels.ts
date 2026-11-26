import { computed } from 'vue'
import type { Weekday } from '../types/calendar'
import { createDateFormatters } from '../utils/createDateFormatters'

export interface CalendarLabelOptions {
  locale: string
  weekdayLabel?: (weekday: Weekday) => string
  monthLabel?: (isoMonth: string) => string
  dayLabel?: (isoDate: string) => string
}

/** Take each calendar text from its function prop when there is one, and from the locale otherwise. */
export function useCalendarLabels(labelOptions: CalendarLabelOptions) {
  const dateFormatters = computed(() => createDateFormatters(labelOptions.locale))

  return {
    dateFormatters,
    resolvedWeekdayLabel: computed(() => labelOptions.weekdayLabel ?? dateFormatters.value.formatWeekday),
    resolvedMonthLabel: computed(() => labelOptions.monthLabel ?? dateFormatters.value.formatMonth),
    resolvedDayLabel: computed(() => labelOptions.dayLabel ?? dateFormatters.value.formatFullDate),
  }
}
