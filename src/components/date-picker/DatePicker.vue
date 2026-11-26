<script lang="ts">
import type { DatePickerBaseProps } from './datePickerProps'

export interface DatePickerProps extends DatePickerBaseProps {
  selectionLabel?: (selectedDate: string) => string
}

export interface DatePickerSlots {
  selection?: (selectionSlotProps: { selectedDate: string }) => unknown
}
</script>

<script setup lang="ts">
import { Calendar, ChevronsUpDown } from 'lucide-vue-next'
import { computed, useId, useTemplateRef } from 'vue'
import { KSelectControl } from '../../elements/select-control'
import { useCalendarLabels } from '../../shared/composables/useCalendarLabels'
import { floatingPanelTransitionClasses } from '../../shared/utils/floatingPanelTransition'
import { clampIsoDate, extractIsoMonth, findLocalTodayIsoDate } from '../../shared/utils/isoDate'
import DateCalendar from './DateCalendar.vue'
import DatePickerPanel from './DatePickerPanel.vue'
import { datePickerTheme } from './date-picker.theme'
import { useDatePickerPopover } from './useDatePickerPopover'

const props = withDefaults(defineProps<DatePickerProps>(), {
  locale: 'en-US',
  weekStartsOn: 0,
  placeholder: 'Select date...',
  clearLabel: 'Clear current value',
  previousMonthLabel: 'Previous month',
  nextMonthLabel: 'Next month',
  size: 'md',
  variant: 'outline',
  pill: true,
  block: false,
  side: 'bottom',
  align: 'start',
  flip: true,
  strategy: 'absolute',
})

const slots = defineSlots<DatePickerSlots>()

const selectedDate = defineModel<string>()
const isOpen = defineModel<boolean>('open', { default: false })

const calendarDialogId = useId()

const selectControl = useTemplateRef<InstanceType<typeof KSelectControl>>('selectControl')
const datePickerPanel = useTemplateRef<InstanceType<typeof DatePickerPanel>>('datePickerPanel')
const dateCalendar = useTemplateRef<InstanceType<typeof DateCalendar>>('dateCalendar')

const rootElement = computed(() => selectControl.value?.rootElement ?? null)
const triggerElement = computed(() => selectControl.value?.triggerElement ?? null)
const panelElement = computed(() => datePickerPanel.value?.panelElement ?? null)

const { dateFormatters, resolvedWeekdayLabel, resolvedMonthLabel, resolvedDayLabel } = useCalendarLabels(props)

const isOpenable = computed(() => !props.disabled)
const hasSelection = computed(() => Boolean(selectedDate.value))

const selectionText = computed(() => {
  if (!selectedDate.value) return props.placeholder
  return props.selectionLabel
    ? props.selectionLabel(selectedDate.value)
    : dateFormatters.value.formatShortDate(selectedDate.value)
})

const initialFocusedDate = computed(() =>
  clampIsoDate(selectedDate.value ?? findLocalTodayIsoDate(), props.min, props.max),
)

const { closeCalendar, toggleCalendar, openCalendarFromTriggerKeys, closeCalendarOnEscape, closeCalendarWhenFocusLeaves } =
  useDatePickerPopover({
    isOpen,
    isOpenable: () => isOpenable.value,
    rootElement,
    triggerElement,
    panelElement,
  })

const triggerAttributes = computed(() => ({
  'role': 'button',
  'tabindex': props.disabled ? -1 : 0,
  'aria-label': hasSelection.value ? `${props.label}, ${selectionText.value}` : props.label,
  'aria-haspopup': 'dialog',
  'aria-expanded': isOpen.value,
  'aria-controls': isOpen.value ? calendarDialogId : undefined,
  'aria-disabled': props.disabled || undefined,
  'aria-invalid': props.invalid || undefined,
  'onClick': toggleCalendar,
  'onKeydown': openCalendarFromTriggerKeys,
}))

const resolvedLeadingIcon = computed(() => (props.leadingIcon === undefined ? Calendar : props.leadingIcon))
const resolvedTrailingIcon = computed(() => (props.trailingIcon === undefined ? ChevronsUpDown : props.trailingIcon))

function selectDate(isoDate: string) {
  selectedDate.value = isoDate
  closeCalendar({ restoreFocus: true })
}

function clearSelectedDate() {
  selectedDate.value = undefined
  triggerElement.value?.focus()
}

const datePickerSlots = computed(() => datePickerTheme({ tabularSelection: true }))
</script>

<template>
  <KSelectControl
    ref="selectControl"
    :size="size"
    :variant="variant"
    :pill="pill"
    :block="block"
    :open="isOpen"
    :invalid="invalid"
    :disabled="disabled"
    :interactive="isOpenable"
    :has-value="hasSelection"
    :leading-icon="resolvedLeadingIcon"
    :trailing-icon="resolvedTrailingIcon"
    :shows-clear-button="clearable && hasSelection && isOpenable"
    :clear-label="clearLabel"
    :trigger-attributes="triggerAttributes"
    :ui="ui"
    :class="props.class"
    @clear="clearSelectedDate"
  >
    <slot v-if="selectedDate && slots.selection" name="selection" :selected-date="selectedDate" />
    <span v-else :class="datePickerSlots.selectionText({ class: ui?.selectionText })">{{ selectionText }}</span>

    <template #popup>
      <input v-if="name && selectedDate" type="hidden" :name="name" :value="selectedDate" />

      <Teleport to="body">
        <Transition v-bind="floatingPanelTransitionClasses">
          <DatePickerPanel
            v-if="isOpen"
            :id="calendarDialogId"
            ref="datePickerPanel"
            :label="label"
            :anchor-element="rootElement"
            :side="side"
            :align="align"
            :flip="flip"
            :strategy="strategy"
            :panel-class="ui?.panel"
            @positioned="dateCalendar?.focusTabbableDay()"
            @keydown="closeCalendarOnEscape"
            @focusout="closeCalendarWhenFocusLeaves"
          >
            <DateCalendar
              ref="dateCalendar"
              :initial-month="extractIsoMonth(initialFocusedDate)"
              :initial-focused-date="initialFocusedDate"
              :selected-start="selectedDate"
              :selected-end="selectedDate"
              :min="min"
              :max="max"
              :disabled-dates="disabledDates"
              :is-date-disabled="isDateDisabled"
              :week-starts-on="weekStartsOn"
              :weekday-label="resolvedWeekdayLabel"
              :month-label="resolvedMonthLabel"
              :day-label="resolvedDayLabel"
              :previous-month-label="previousMonthLabel"
              :next-month-label="nextMonthLabel"
              :ui="ui"
              @select-date="selectDate"
            />
          </DatePickerPanel>
        </Transition>
      </Teleport>
    </template>
  </KSelectControl>
</template>
