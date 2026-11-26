<script lang="ts">
import type { DatePickerFieldBaseProps, SingleDateProps } from './datePickerProps'

export interface DatePickerFieldProps extends DatePickerFieldBaseProps, SingleDateProps {}
</script>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { KSelectFieldControl } from '../../elements/select-field-control'
import { useFieldDescription } from '../../shared/composables/useFieldDescription'
import DateCalendarPopover from './DateCalendarPopover.vue'
import { datePickerTheme } from './date-picker.theme'
import type { DatePickerSlots } from './datePickerProps'
import { useDatePickerControl } from './useDatePickerControl'
import { useSingleDateSelection } from './useSingleDateSelection'
import { useSingleDateTyping } from './useSingleDateTyping'

const props = withDefaults(defineProps<DatePickerFieldProps>(), {
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

const slots = defineSlots<DatePickerSlots>()

const selectedDate = defineModel<string>()
const isOpen = defineModel<boolean>('open', { default: false })

const selectFieldControl = useTemplateRef<InstanceType<typeof KSelectFieldControl>>('selectFieldControl')
const calendarPopover = useTemplateRef<InstanceType<typeof DateCalendarPopover>>('calendarPopover')
const dateInput = useTemplateRef<HTMLInputElement>('dateInput')

const containerElement = computed(() => selectFieldControl.value?.containerElement ?? null)
const focusTargetElement = computed(() =>
  props.editable ? dateInput.value : (selectFieldControl.value?.triggerElement ?? null),
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
  onClose: () => resetCalendarFocusMode(),
})

const { hasSelection, selectionText, initialFocusedDate } = useSingleDateSelection(selectedDate, props, dateFormatters)

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
  containerElement,
  dateInput,
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

const dateInputAttributes = computed(() => ({
  ...typedInputAttributes.value,
  ...typedInputListeners,
  'id': fieldId.value,
  'aria-labelledby': labelId.value,
  'aria-describedby': describingElementId.value,
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
        :anchor-element="containerElement"
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
  </KSelectFieldControl>
</template>
