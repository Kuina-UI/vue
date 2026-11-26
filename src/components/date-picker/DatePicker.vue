<script lang="ts">
import type { DatePickerBaseProps, SingleDateProps } from './datePickerProps'

export interface DatePickerProps extends DatePickerBaseProps, SingleDateProps {}
</script>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { KSelectControl } from '../../elements/select-control'
import DateCalendarPopover from './DateCalendarPopover.vue'
import { datePickerTheme } from './date-picker.theme'
import type { DatePickerSlots } from './datePickerProps'
import { useDatePickerControl } from './useDatePickerControl'
import { useSingleDateSelection } from './useSingleDateSelection'
import { useSingleDateTyping } from './useSingleDateTyping'

const props = withDefaults(defineProps<DatePickerProps>(), {
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

const slots = defineSlots<DatePickerSlots>()

const selectedDate = defineModel<string>()
const isOpen = defineModel<boolean>('open', { default: false })

const selectControl = useTemplateRef<InstanceType<typeof KSelectControl>>('selectControl')
const calendarPopover = useTemplateRef<InstanceType<typeof DateCalendarPopover>>('calendarPopover')
const dateInput = useTemplateRef<HTMLInputElement>('dateInput')

const rootElement = computed(() => selectControl.value?.rootElement ?? null)
const focusTargetElement = computed(() => (props.editable ? dateInput.value : (selectControl.value?.triggerElement ?? null)))

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
  onClose: () => resetCalendarFocusMode(),
})

const { hasSelection, selectionText, initialFocusedDate } = useSingleDateSelection(
  selectedDate,
  props,
  dateFormatters,
  'Select date...',
)

const {
  dateInputMask,
  typedText,
  isTypedDateRejected,
  movesFocusIntoCalendar,
  openCalendarFromControlClick,
  resetCalendarFocusMode,
  typedInputListeners,
} = useSingleDateTyping({
  selectedDate,
  typingProps: props,
  calendar: {
    isOpen,
    openCalendar,
    closeCalendar,
    closeCalendarWhenFocusLeaves,
    showDate: (isoDate) => calendarPopover.value?.showDate(isoDate),
    focusCalendar: () => calendarPopover.value?.focusCalendar(),
    panelElement: () => calendarPopover.value?.panelElement,
  },
  containerElement: rootElement,
  dateInput,
})

const triggerAttributes = computed(() => {
  if (props.editable) return { onClick: openCalendarFromControlClick }

  return {
    ...dialogTriggerAttributes.value,
    'aria-label': hasSelection.value ? `${props.label}, ${selectionText.value}` : props.label,
  }
})

const dateInputAttributes = computed(() => ({
  ...typedInputAttributes.value,
  ...typedInputListeners,
  'aria-label': props.label,
  'value': typedText.value,
  'placeholder': props.placeholder ?? dateInputMask.value.formatHint,
}))

function selectDate(isoDate: string) {
  selectedDate.value = isoDate
  closeCalendar({ restoreFocus: true })
}

function clearSelectedDate() {
  selectedDate.value = undefined
  focusTargetElement.value?.focus()
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
    @clear="clearSelectedDate"
  >
    <template v-if="editable" #input="{ inputClass }">
      <input
        ref="dateInput"
        v-bind="dateInputAttributes"
        :class="datePickerSlots.selectionText({ class: [inputClass, ui?.selectionText] })"
      />
    </template>

    <slot v-if="selectedDate && slots.selection" name="selection" :selected-date="selectedDate" />
    <span v-else :class="datePickerSlots.selectionText({ class: ui?.selectionText })">{{ selectionText }}</span>

    <template #popup>
      <input v-if="name && selectedDate" type="hidden" :name="name" :value="selectedDate" />

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
        :focuses-calendar-on-open="!editable || movesFocusIntoCalendar"
        :ui="ui"
        @select-date="selectDate"
        @panel-keydown="closeCalendarOnEscape"
        @panel-focusout="closeCalendarWhenFocusLeaves"
      />
    </template>
  </KSelectControl>
</template>
