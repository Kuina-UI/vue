<script lang="ts">
import type { DatePickerFieldBaseProps, DateRangeProps } from './datePickerProps'

export interface DateRangePickerFieldProps extends DatePickerFieldBaseProps, DateRangeProps {}
</script>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { KSelectFieldControl } from '../../elements/select-field-control'
import { useFieldDescription } from '../../shared/composables/useFieldDescription'
import type { DateRange } from '../../shared/types/calendar'
import DateCalendarPopover from './DateCalendarPopover.vue'
import { datePickerTheme } from './date-picker.theme'
import type { DateRangePickerSlots } from './datePickerProps'
import { useDatePickerControl } from './useDatePickerControl'
import { useDateRangeSelection } from './useDateRangeSelection'
import { useDateRangeTyping } from './useDateRangeTyping'

const props = withDefaults(defineProps<DateRangePickerFieldProps>(), {
  shortcuts: () => [],
  locale: 'en-US',
  weekStartsOn: 0,
  clearLabel: 'Clear current value',
  previousMonthLabel: 'Previous month',
  nextMonthLabel: 'Next month',
  size: '4xl',
  variant: 'outline',
  pill: true,
  floatLabel: 'auto',
  side: 'bottom',
  align: 'start',
  flip: true,
  strategy: 'absolute',
})

const slots = defineSlots<DateRangePickerSlots>()

const selectedRange = defineModel<DateRange>()
const isOpen = defineModel<boolean>('open', { default: false })

const selectFieldControl = useTemplateRef<InstanceType<typeof KSelectFieldControl>>('selectFieldControl')
const calendarPopover = useTemplateRef<InstanceType<typeof DateCalendarPopover>>('calendarPopover')
const rangeInput = useTemplateRef<HTMLInputElement>('rangeInput')

const containerElement = computed(() => selectFieldControl.value?.containerElement ?? null)
const focusTargetElement = computed(() =>
  props.editable ? rangeInput.value : (selectFieldControl.value?.triggerElement ?? null),
)

const { fieldId, hintId, errorMessageId, isInvalid, describingElementId } = useFieldDescription(props)

const labelId = computed(() => `${fieldId.value}-label`)
const valueId = computed(() => `${fieldId.value}-value`)

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
  isInvalid: () => isInvalid.value || isTypedDateRejected.value,
  rootElement: containerElement,
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
  containerElement,
  rangeInput,
})

const triggerAttributes = computed(() => {
  if (props.editable) return { onClick: openCalendarFromControlClick }

  return {
    ...dialogTriggerAttributes.value,
    'id': fieldId.value,
    'aria-labelledby': hasSelection.value ? `${labelId.value} ${valueId.value}` : labelId.value,
    'aria-describedby': describingElementId.value,
  }
})

const rangeInputAttributes = computed(() => ({
  ...typedInputAttributes.value,
  ...typedInputListeners,
  'id': fieldId.value,
  'aria-labelledby': labelId.value,
  'aria-describedby': describingElementId.value,
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
  <KSelectFieldControl
    ref="selectFieldControl"
    :label="label"
    :label-id="labelId"
    :value-id="valueId"
    :hint-id="hintId"
    :error-message-id="errorMessageId"
    :placeholder="placeholder"
    :hint="hint"
    :error-message="errorMessage"
    :size="size"
    :variant="variant"
    :pill="pill"
    :float-label="floatLabel"
    :open="isOpen"
    :invalid="isInvalid || isTypedDateRejected"
    :disabled="disabled"
    :has-value="editable ? Boolean(typedText) : hasSelection"
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
        :anchor-element="containerElement"
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
  </KSelectFieldControl>
</template>
