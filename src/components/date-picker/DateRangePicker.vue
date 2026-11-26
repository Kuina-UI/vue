<script lang="ts">
import type { DatePickerBaseProps, DateRangeProps } from './datePickerProps'

export interface DateRangePickerProps extends DatePickerBaseProps, DateRangeProps {}
</script>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { KSelectControl } from '../../elements/select-control'
import type { DateRange } from '../../shared/types/calendar'
import DateCalendarPopover from './DateCalendarPopover.vue'
import { datePickerTheme } from './date-picker.theme'
import type { DateRangePickerSlots } from './datePickerProps'
import { useDatePickerControl } from './useDatePickerControl'
import { useDateRangeSelection } from './useDateRangeSelection'
import { useDateRangeTyping } from './useDateRangeTyping'

const props = withDefaults(defineProps<DateRangePickerProps>(), {
  shortcuts: () => [],
  locale: 'en-US',
  weekStartsOn: 0,
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

const slots = defineSlots<DateRangePickerSlots>()

const selectedRange = defineModel<DateRange>()
const isOpen = defineModel<boolean>('open', { default: false })

const selectControl = useTemplateRef<InstanceType<typeof KSelectControl>>('selectControl')
const calendarPopover = useTemplateRef<InstanceType<typeof DateCalendarPopover>>('calendarPopover')
const rangeInput = useTemplateRef<HTMLInputElement>('rangeInput')

const rootElement = computed(() => selectControl.value?.rootElement ?? null)
const focusTargetElement = computed(() =>
  props.editable ? rangeInput.value : (selectControl.value?.triggerElement ?? null),
)

const {
  calendarDialogId,
  isOpenable,
  dateFormatters,
  resolvedWeekdayLabel,
  resolvedMonthLabel,
  resolvedDayLabel,
  openCalendar,
  closeCalendar,
  closeCalendarOnEscape,
  closeCalendarWhenFocusLeaves,
  dialogTriggerAttributes,
  typedInputAttributes,
  resolvedLeadingIcon,
  resolvedTrailingIcon,
} = useDatePickerControl(props, {
  isOpen,
  isInvalid: () => props.invalid || isTypedDateRejected.value,
  rootElement,
  triggerElement: focusTargetElement,
  panelElement: computed(() => calendarPopover.value?.panelElement ?? null),
  onClose: () => {
    forgetPendingRange()
    resetCalendarFocusMode()
  },
})

const calendarControls = {
  isOpen,
  openCalendar,
  closeCalendar,
  closeCalendarWhenFocusLeaves,
  showDate: (isoDate: string) => calendarPopover.value?.showDate(isoDate),
  focusCalendar: () => calendarPopover.value?.focusCalendar(),
  panelElement: () => calendarPopover.value?.panelElement,
}

const {
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
} = useDateRangeSelection(selectedRange, props, {
  dateFormatters,
  fallbackPlaceholder: 'Select date range...',
  showDate: calendarControls.showDate,
})

const {
  dateInputMask,
  typedText,
  isTypedDateRejected,
  movesFocusIntoCalendar,
  openCalendarFromControlClick,
  resetCalendarFocusMode,
  typedInputListeners,
} = useDateRangeTyping({
  selectedRange,
  typingProps: props,
  calendar: calendarControls,
  containerElement: rootElement,
  rangeInput,
})

const triggerAttributes = computed(() => {
  if (props.editable) return { onClick: openCalendarFromControlClick }

  return {
    ...dialogTriggerAttributes.value,
    'aria-label': hasSelection.value ? `${props.label}, ${selectionText.value}` : props.label,
  }
})

const rangeInputAttributes = computed(() => ({
  ...typedInputAttributes.value,
  ...typedInputListeners,
  'aria-label': props.label,
  'value': typedText.value,
  'placeholder': props.placeholder ?? dateInputMask.value.rangeFormatHint,
}))

function clearSelectedRange() {
  selectedRange.value = undefined
  focusTargetElement.value?.focus()
}

const datePickerSlots = computed(() => datePickerTheme({ tabularSelection: props.editable || !activeShortcut.value }))

</script>

<template>
  <KSelectControl
    ref="selectControl"
    :size="size"
    :variant="variant"
    :pill="pill"
    :block="block"
    :open="isOpen"
    :invalid="invalid || isTypedDateRejected"
    :disabled="disabled"
    :interactive="isOpenable"
    :has-value="editable ? Boolean(typedText) : hasSelection"
    :searches-in-trigger="editable"
    :leading-icon="resolvedLeadingIcon"
    :trailing-icon="resolvedTrailingIcon"
    :shows-clear-button="clearable && hasSelection && isOpenable"
    :clear-label="clearLabel"
    :trigger-attributes="triggerAttributes"
    :ui="ui"
    :class="props.class"
    @clear="clearSelectedRange"
  >
    <template v-if="editable" #input="{ inputClass }">
      <input
        ref="rangeInput"
        v-bind="rangeInputAttributes"
        :class="datePickerSlots.selectionText({ class: [inputClass, ui?.selectionText] })"
      />
    </template>

    <slot
      v-if="selectedRange && slots.selection"
      name="selection"
      :selected-range="selectedRange"
      :active-shortcut="activeShortcut"
    />
    <span v-else :class="datePickerSlots.selectionText({ class: ui?.selectionText })">{{ selectionText }}</span>

    <template #popup>
      <template v-if="name && selectedRange">
        <input
          v-for="(rangeDate, rangeDateIndex) in selectedRange"
          :key="rangeDateIndex"
          type="hidden"
          :name="name"
          :value="rangeDate"
        />
      </template>

      <DateCalendarPopover
        ref="calendarPopover"
        :open="isOpen"
        :dialog-id="calendarDialogId"
        :label="label"
        :anchor-element="rootElement"
        :side="side"
        :align="align"
        :flip="flip"
        :strategy="strategy"
        :initial-focused-date="initialFocusedDate"
        :month-count="2"
        :selected-start="displayedRange?.[0]"
        :selected-end="displayedRange?.[1]"
        :min="min"
        :max="max"
        :disabled-dates="disabledDates"
        :is-date-disabled="isDateDisabledDuringSelection"
        :week-starts-on="weekStartsOn"
        :weekday-label="resolvedWeekdayLabel"
        :month-label="resolvedMonthLabel"
        :day-label="resolvedDayLabel"
        :previous-month-label="previousMonthLabel"
        :next-month-label="nextMonthLabel"
        :shortcuts="shortcuts"
        :active-shortcut="activeShortcut"
        :focuses-calendar-on-open="!editable || movesFocusIntoCalendar"
        :ui="ui"
        @select-date="selectRangeDate"
        @hover-date="previewRangeEnd"
        @leave-dates="resetRangePreview"
        @select-shortcut="selectShortcut"
        @panel-keydown="closeCalendarOnEscape"
        @panel-focusout="closeCalendarWhenFocusLeaves"
      />
    </template>
  </KSelectControl>
</template>
