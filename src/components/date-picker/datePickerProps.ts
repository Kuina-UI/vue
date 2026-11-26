import type { Component } from 'vue'
import type { SelectControlSlotName, SelectControlThemeVariants } from '../../elements/select-control'
import type { SelectFieldControlSlotName, SelectFieldControlThemeVariants } from '../../elements/select-field-control'
import type { DateOrDateRange, DateRange, Weekday } from '../../shared/types/calendar'
import type { FloatingAlign, FloatingSide, FloatingStrategy } from '../../shared/types/floating-position'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { DateCalendarSlotName } from './date-calendar.theme'
import type { DatePickerSlotName } from './date-picker.theme'

export interface DateRangeShortcut {
  label: string
  value: DateRange
}

export interface DatePickerSharedProps {
  label: string
  editable?: boolean
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
  pill?: boolean
  leadingIcon?: Component | null
  trailingIcon?: Component | null
  side?: FloatingSide
  align?: FloatingAlign
  flip?: boolean
  strategy?: FloatingStrategy
  class?: ClassNameValue
}

export interface DatePickerBaseProps extends DatePickerSharedProps {
  size?: SelectControlThemeVariants['size']
  variant?: SelectControlThemeVariants['variant']
  block?: boolean
  ui?: Partial<Record<SelectControlSlotName | DatePickerSlotName | DateCalendarSlotName, ClassNameValue>>
}

export interface DatePickerFieldBaseProps extends DatePickerSharedProps {
  id?: string
  hint?: string
  errorMessage?: string
  floatLabel?: SelectFieldControlThemeVariants['floatLabel']
  size?: SelectFieldControlThemeVariants['size']
  variant?: SelectFieldControlThemeVariants['variant']
  ui?: Partial<Record<SelectFieldControlSlotName | DatePickerSlotName | DateCalendarSlotName, ClassNameValue>>
}

export interface SingleDateProps {
  selectionLabel?: (selectedDate: string) => string
}

export interface DateRangeProps {
  shortcuts?: DateRangeShortcut[]
  maxRangeDays?: number
  selectionLabel?: (selectedRange: DateRange, activeShortcut?: DateRangeShortcut) => string
}

export interface DatePickerSlots {
  selection?: (selectionSlotProps: { selectedDate: string }) => unknown
}

export interface DateRangePickerSlots {
  selection?: (selectionSlotProps: { selectedRange: DateRange; activeShortcut?: DateRangeShortcut }) => unknown
}
