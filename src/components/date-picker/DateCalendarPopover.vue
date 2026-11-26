<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { computed, useTemplateRef } from 'vue'
import { KButton } from '../../elements/button'
import type { DateOrDateRange, Weekday } from '../../shared/types/calendar'
import type { FloatingAlign, FloatingSide, FloatingStrategy } from '../../shared/types/floating-position'
import { floatingPanelTransitionClasses } from '../../shared/utils/floatingPanelTransition'
import { extractIsoMonth } from '../../shared/utils/isoDate'
import type { ClassNameValue } from '../../shared/utils/tv'
import DateCalendar from './DateCalendar.vue'
import DatePickerPanel from './DatePickerPanel.vue'
import type { DateCalendarSlotName } from './date-calendar.theme'
import { type DatePickerSlotName, datePickerTheme } from './date-picker.theme'
import type { DateRangeShortcut } from './datePickerProps'

const props = withDefaults(
  defineProps<{
    open: boolean
    dialogId: string
    label: string
    anchorElement: HTMLElement | null | undefined
    side: FloatingSide
    align: FloatingAlign
    flip: boolean
    strategy: FloatingStrategy
    initialFocusedDate: string
    monthCount?: number
    selectedStart?: string
    selectedEnd?: string
    min?: string
    max?: string
    disabledDates?: DateOrDateRange[]
    isDateDisabled?: (isoDate: string) => boolean
    weekStartsOn: Weekday
    weekdayLabel: (weekday: Weekday) => string
    monthLabel: (isoMonth: string) => string
    dayLabel: (isoDate: string) => string
    previousMonthLabel: string
    nextMonthLabel: string
    shortcuts?: DateRangeShortcut[]
    activeShortcut?: DateRangeShortcut
    focusesCalendarOnOpen?: boolean
    ui?: Partial<Record<DatePickerSlotName | DateCalendarSlotName, ClassNameValue>>
  }>(),
  { monthCount: 1, shortcuts: () => [], focusesCalendarOnOpen: true },
)

const emit = defineEmits<{
  selectDate: [isoDate: string]
  hoverDate: [isoDate: string]
  leaveDates: []
  selectShortcut: [shortcut: DateRangeShortcut]
  panelKeydown: [keyboardEvent: KeyboardEvent]
  panelFocusout: [focusEvent: FocusEvent]
}>()

const datePickerPanel = useTemplateRef<InstanceType<typeof DatePickerPanel>>('datePickerPanel')
const dateCalendar = useTemplateRef<InstanceType<typeof DateCalendar>>('dateCalendar')

const panelElement = computed(() => datePickerPanel.value?.panelElement ?? null)

function showDate(isoDate: string) {
  dateCalendar.value?.showDate(isoDate)
}

function focusCalendar() {
  dateCalendar.value?.focusTabbableDay()
}

function focusCalendarOnOpen() {
  if (props.focusesCalendarOnOpen) focusCalendar()
}

defineExpose({ panelElement, showDate, focusCalendar })

const popoverSlots = computed(() => datePickerTheme())

function findShortcutSlots(shortcut: DateRangeShortcut) {
  return datePickerTheme({ activeShortcut: shortcut === props.activeShortcut })
}
</script>

<template>
  <Teleport to="body">
    <Transition v-bind="floatingPanelTransitionClasses">
      <DatePickerPanel
        v-if="open"
        :id="dialogId"
        ref="datePickerPanel"
        :label="label"
        :anchor-element="anchorElement"
        :side="side"
        :align="align"
        :flip="flip"
        :strategy="strategy"
        :panel-class="ui?.panel"
        @positioned="focusCalendarOnOpen"
        @keydown="emit('panelKeydown', $event)"
        @focusout="emit('panelFocusout', $event)"
      >
        <div v-if="shortcuts.length" :class="popoverSlots.shortcuts({ class: ui?.shortcuts })">
          <KButton
            v-for="shortcut in shortcuts"
            :key="shortcut.label"
            variant="ghost"
            color="neutral"
            :pill="false"
            block
            :selected="shortcut === activeShortcut"
            :ui="{ label: 'w-full' }"
            @click="emit('selectShortcut', shortcut)"
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
          :month-count="monthCount"
          :selected-start="selectedStart"
          :selected-end="selectedEnd"
          :min="min"
          :max="max"
          :disabled-dates="disabledDates"
          :is-date-disabled="isDateDisabled"
          :week-starts-on="weekStartsOn"
          :weekday-label="weekdayLabel"
          :month-label="monthLabel"
          :day-label="dayLabel"
          :previous-month-label="previousMonthLabel"
          :next-month-label="nextMonthLabel"
          :ui="ui"
          @select-date="emit('selectDate', $event)"
          @hover-date="emit('hoverDate', $event)"
          @leave-dates="emit('leaveDates')"
        />
      </DatePickerPanel>
    </Transition>
  </Teleport>
</template>
