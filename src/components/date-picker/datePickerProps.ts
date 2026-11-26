import type { Component } from 'vue'
import type { SelectControlSlotName, SelectControlThemeVariants } from '../../elements/select-control'
import type { DateOrDateRange, Weekday } from '../../shared/types/calendar'
import type { FloatingAlign, FloatingSide, FloatingStrategy } from '../../shared/types/floating-position'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { DateCalendarSlotName } from './date-calendar.theme'
import type { DatePickerSlotName } from './date-picker.theme'

export interface DatePickerBaseProps {
  label: string
  min?: string
  max?: string
  disabledDates?: DateOrDateRange[]
  isDateDisabled?: (isoDate: string) => boolean
  locale?: string
  weekStartsOn?: Weekday
  weekdayLabel?: (weekday: Weekday) => string
  monthLabel?: (isoMonth: string) => string
  dayLabel?: (isoDate: string) => string
  placeholder?: string
  clearable?: boolean
  clearLabel?: string
  previousMonthLabel?: string
  nextMonthLabel?: string
  name?: string
  disabled?: boolean
  invalid?: boolean
  size?: SelectControlThemeVariants['size']
  variant?: SelectControlThemeVariants['variant']
  pill?: boolean
  block?: boolean
  leadingIcon?: Component | null
  trailingIcon?: Component | null
  side?: FloatingSide
  align?: FloatingAlign
  flip?: boolean
  strategy?: FloatingStrategy
  ui?: Partial<Record<SelectControlSlotName | DatePickerSlotName | DateCalendarSlotName, ClassNameValue>>
  class?: ClassNameValue
}
