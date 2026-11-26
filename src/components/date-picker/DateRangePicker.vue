<script lang="ts">
import type { DateRange } from '../../shared/types/calendar'
import type { DatePickerBaseProps } from './datePickerProps'

export type { DateRange }

export interface DateRangeShortcut {
  label: string
  value: DateRange
}

export interface DateRangePickerProps extends DatePickerBaseProps {
  shortcuts?: DateRangeShortcut[]
  maxRangeDays?: number
  selectionLabel?: (selectedRange: DateRange, activeShortcut?: DateRangeShortcut) => string
}

export interface DateRangePickerSlots {
  selection?: (selectionSlotProps: { selectedRange: DateRange; activeShortcut?: DateRangeShortcut }) => unknown
}
</script>

<script setup lang="ts">
import { Calendar, Check, ChevronsUpDown } from 'lucide-vue-next'
import { computed, ref, useId, useTemplateRef } from 'vue'
import { KButton } from '../../elements/button'
import { KSelectControl } from '../../elements/select-control'
import { useCalendarLabels } from '../../shared/composables/useCalendarLabels'
import { floatingPanelTransitionClasses } from '../../shared/utils/floatingPanelTransition'
import { addDaysToIsoDate, clampIsoDate, extractIsoMonth, findLocalTodayIsoDate } from '../../shared/utils/isoDate'
import DateCalendar from './DateCalendar.vue'
import DatePickerPanel from './DatePickerPanel.vue'
import { datePickerTheme } from './date-picker.theme'
import { useDatePickerPopover } from './useDatePickerPopover'

const props = withDefaults(defineProps<DateRangePickerProps>(), {
  shortcuts: () => [],
  locale: 'en-US',
  weekStartsOn: 0,
  placeholder: 'Select date range...',
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

const calendarDialogId = useId()

const selectControl = useTemplateRef<InstanceType<typeof KSelectControl>>('selectControl')
const datePickerPanel = useTemplateRef<InstanceType<typeof DatePickerPanel>>('datePickerPanel')
const dateCalendar = useTemplateRef<InstanceType<typeof DateCalendar>>('dateCalendar')

const rootElement = computed(() => selectControl.value?.rootElement ?? null)
const triggerElement = computed(() => selectControl.value?.triggerElement ?? null)
const panelElement = computed(() => datePickerPanel.value?.panelElement ?? null)

const pendingRangeStart = ref<string>()
const pendingRangeEnd = ref<string>()

const { dateFormatters, resolvedWeekdayLabel, resolvedMonthLabel, resolvedDayLabel } = useCalendarLabels(props)

const isOpenable = computed(() => !props.disabled)
const hasSelection = computed(() => Boolean(selectedRange.value))

const activeShortcut = computed(() => {
  const range = selectedRange.value
  if (!range) return undefined
  return props.shortcuts.find((shortcut) => shortcut.value[0] === range[0] && shortcut.value[1] === range[1])
})

const selectionText = computed(() => {
  const range = selectedRange.value

  if (!range) return props.placeholder
  if (props.selectionLabel) return props.selectionLabel(range, activeShortcut.value)
  if (activeShortcut.value) return activeShortcut.value.label

  const [rangeStart, rangeEnd] = range
  const { formatShortDate } = dateFormatters.value

  return rangeStart === rangeEnd ? formatShortDate(rangeStart) : `${formatShortDate(rangeStart)} – ${formatShortDate(rangeEnd)}`
})

const displayedRange = computed<DateRange | undefined>(() => {
  if (pendingRangeStart.value) return [pendingRangeStart.value, pendingRangeEnd.value ?? pendingRangeStart.value]
  return selectedRange.value
})

const initialFocusedDate = computed(() =>
  clampIsoDate(selectedRange.value?.[0] ?? findLocalTodayIsoDate(), props.min, props.max),
)

function isDateDisabledDuringSelection(isoDate: string) {
  if (props.isDateDisabled?.(isoDate)) return true
  if (!pendingRangeStart.value || props.maxRangeDays === undefined) return false
  return isoDate > addDaysToIsoDate(pendingRangeStart.value, props.maxRangeDays - 1)
}

function forgetPendingRange() {
  pendingRangeStart.value = undefined
  pendingRangeEnd.value = undefined
}

const { toggleCalendar, openCalendarFromTriggerKeys, closeCalendarOnEscape, closeCalendarWhenFocusLeaves } =
  useDatePickerPopover({
    isOpen,
    isOpenable: () => isOpenable.value,
    rootElement,
    triggerElement,
    panelElement,
    onClose: forgetPendingRange,
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
  if (pendingRangeStart.value) pendingRangeEnd.value = isoDate < pendingRangeStart.value ? pendingRangeStart.value : isoDate
}

function resetRangePreview() {
  pendingRangeEnd.value = pendingRangeStart.value
}

function selectShortcut(shortcut: DateRangeShortcut) {
  selectedRange.value = [shortcut.value[0], shortcut.value[1]]
  forgetPendingRange()
  dateCalendar.value?.revealDate(shortcut.value[0])
}

function clearSelectedRange() {
  selectedRange.value = undefined
  triggerElement.value?.focus()
}

const datePickerSlots = computed(() => datePickerTheme({ tabularSelection: !activeShortcut.value }))

function findShortcutSlots(shortcut: DateRangeShortcut) {
  return datePickerTheme({ activeShortcut: shortcut === activeShortcut.value })
}
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
    @clear="clearSelectedRange"
  >
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
            <div v-if="shortcuts.length" :class="datePickerSlots.shortcuts({ class: ui?.shortcuts })">
              <KButton
                v-for="shortcut in shortcuts"
                :key="shortcut.label"
                variant="ghost"
                color="neutral"
                :pill="false"
                block
                :selected="shortcut === activeShortcut"
                :ui="{ label: 'w-full' }"
                @click="selectShortcut(shortcut)"
              >
                <span :class="findShortcutSlots(shortcut).shortcutLabel({ class: ui?.shortcutLabel })">
                  {{ shortcut.label }}
                  <Check
                    v-if="shortcut === activeShortcut"
                    :class="findShortcutSlots(shortcut).shortcutCheckIcon({ class: ui?.shortcutCheckIcon })"
                  />
                </span>
              </KButton>
            </div>

            <DateCalendar
              ref="dateCalendar"
              :initial-month="extractIsoMonth(initialFocusedDate)"
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
              :ui="ui"
              @select-date="selectRangeDate"
              @hover-date="previewRangeEnd"
              @leave-dates="resetRangePreview"
            />
          </DatePickerPanel>
        </Transition>
      </Teleport>
    </template>
  </KSelectControl>
</template>
