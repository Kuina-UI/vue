<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed, nextTick, onMounted, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { KButton } from '../../elements/button'
import type { DateOrDateRange, Weekday } from '../../shared/types/calendar'
import { createCalendarMonth, orderWeekdays } from '../../shared/utils/calendarMonth'
import {
  addDaysToIsoDate,
  addMonthsToIsoDate,
  addMonthsToIsoMonth,
  clampIsoDate,
  countMonthsBetweenIsoMonths,
  extractIsoMonth,
  findIsoDateWeekday,
  findLocalTodayIsoDate,
  isIsoDateInDateList,
} from '../../shared/utils/isoDate'
import type { ClassNameValue } from '../../shared/utils/tv'
import DateCalendarMonth from './DateCalendarMonth.vue'
import { type DateCalendarSlotName, dateCalendarTheme } from './date-calendar.theme'

const props = withDefaults(
  defineProps<{
    initialMonth: string
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
    ui?: Partial<Record<DateCalendarSlotName, ClassNameValue>>
  }>(),
  { monthCount: 1 },
)

const emit = defineEmits<{
  selectDate: [isoDate: string]
  hoverDate: [isoDate: string]
  leaveDates: []
}>()

const carouselMonthStride = 242
const daysPerWeek = 7

const viewportElement = useTemplateRef<HTMLElement>('viewportElement')

const today = findLocalTodayIsoDate()
const firstVisibleMonth = ref(props.initialMonth)
const carouselStep = ref(0)
const carouselResetCount = ref(0)
const focusedDate = ref(props.initialFocusedDate)
const viewportHeight = shallowRef<number>()
const animatesHeight = ref(false)

const weekdays = computed(() => orderWeekdays(props.weekStartsOn))

const visibleMonths = computed(() =>
  Array.from({ length: props.monthCount }, (_, monthOffset) => ({
    calendarMonth: createCalendarMonth(addMonthsToIsoMonth(firstVisibleMonth.value, monthOffset), props.weekStartsOn),
    carouselPosition: carouselStep.value + monthOffset,
    monthOffset,
  })),
)

const firstCalendarMonth = computed(() => visibleMonths.value[0].calendarMonth)
const lastCalendarMonth = computed(() => visibleMonths.value[visibleMonths.value.length - 1].calendarMonth)

const canShowPreviousMonth = computed(() => !props.min || props.min < firstCalendarMonth.value.firstIsoDate)
const canShowNextMonth = computed(() => !props.max || lastCalendarMonth.value.lastIsoDate < props.max)

const tabbableDate = computed(() => {
  const isFocusedDateVisible =
    focusedDate.value >= firstCalendarMonth.value.firstIsoDate && focusedDate.value <= lastCalendarMonth.value.lastIsoDate
  return isFocusedDateVisible ? focusedDate.value : firstCalendarMonth.value.firstIsoDate
})

function isDateUnavailable(isoDate: string) {
  if (props.min && isoDate < props.min) return true
  if (props.max && isoDate > props.max) return true
  if (props.disabledDates && isIsoDateInDateList(isoDate, props.disabledDates)) return true
  return Boolean(props.isDateDisabled?.(isoDate))
}

function showPreviousMonth() {
  carouselStep.value -= 1
  firstVisibleMonth.value = addMonthsToIsoMonth(firstVisibleMonth.value, -1)
}

function showNextMonth() {
  carouselStep.value += 1
  firstVisibleMonth.value = addMonthsToIsoMonth(firstVisibleMonth.value, 1)
}

/** Bring a date into view: slide one month when it is next to the visible ones, else jump to it without sliding. */
function revealDate(isoDate: string) {
  const targetMonth = extractIsoMonth(isoDate)
  const monthOffset = countMonthsBetweenIsoMonths(firstVisibleMonth.value, targetMonth)

  if (monthOffset >= 0 && monthOffset < props.monthCount) return
  if (monthOffset === -1) return showPreviousMonth()
  if (monthOffset === props.monthCount) return showNextMonth()

  firstVisibleMonth.value = monthOffset < 0 ? targetMonth : addMonthsToIsoMonth(targetMonth, 1 - props.monthCount)
  carouselStep.value = 0
  carouselResetCount.value += 1
}

function focusTabbableDay() {
  viewportElement.value?.querySelector<HTMLElement>(`[data-iso-date="${tabbableDate.value}"]`)?.focus()
}

function findKeyboardTargetDate(keyboardEvent: KeyboardEvent, isoDate: string) {
  const weekdayColumn = (findIsoDateWeekday(isoDate) - props.weekStartsOn + daysPerWeek) % daysPerWeek
  const monthStep = keyboardEvent.shiftKey ? 12 : 1

  switch (keyboardEvent.key) {
    case 'ArrowLeft':
      return addDaysToIsoDate(isoDate, -1)
    case 'ArrowRight':
      return addDaysToIsoDate(isoDate, 1)
    case 'ArrowUp':
      return addDaysToIsoDate(isoDate, -daysPerWeek)
    case 'ArrowDown':
      return addDaysToIsoDate(isoDate, daysPerWeek)
    case 'Home':
      return addDaysToIsoDate(isoDate, -weekdayColumn)
    case 'End':
      return addDaysToIsoDate(isoDate, daysPerWeek - 1 - weekdayColumn)
    case 'PageUp':
      return addMonthsToIsoDate(isoDate, -monthStep)
    case 'PageDown':
      return addMonthsToIsoDate(isoDate, monthStep)
    default:
      return undefined
  }
}

function moveFocusFromKeyboard(keyboardEvent: KeyboardEvent, isoDate: string) {
  const keyboardTargetDate = findKeyboardTargetDate(keyboardEvent, isoDate)

  if (!keyboardTargetDate) return

  keyboardEvent.preventDefault()
  focusedDate.value = clampIsoDate(keyboardTargetDate, props.min, props.max)
  revealDate(focusedDate.value)
  nextTick(focusTabbableDay)
}

function selectDate(isoDate: string) {
  focusedDate.value = isoDate
  emit('selectDate', isoDate)
}

function markLeavingMonth(monthElement: Element) {
  monthElement.setAttribute('data-leaving-month', '')
}

function measureViewportHeight() {
  const shownMonthElements = viewportElement.value?.querySelectorAll<HTMLElement>(
    '[data-calendar-month]:not([data-leaving-month])',
  )
  const tallestMonthHeight = Math.max(0, ...[...(shownMonthElements ?? [])].map((monthElement) => monthElement.offsetHeight))

  if (tallestMonthHeight > 0) viewportHeight.value = tallestMonthHeight
}

onMounted(() => {
  watch(visibleMonths, measureViewportHeight, { immediate: true, flush: 'post' })
  requestAnimationFrame(() => {
    animatesHeight.value = true
  })
})

defineExpose({ focusTabbableDay, revealDate })

const calendarSlots = computed(() =>
  dateCalendarTheme({ showsTwoMonths: props.monthCount > 1, animatesHeight: animatesHeight.value }),
)
</script>

<template>
  <div :class="calendarSlots.calendar({ class: ui?.calendar })">
    <div
      ref="viewportElement"
      :style="{ height: viewportHeight === undefined ? undefined : `${viewportHeight}px` }"
      :class="calendarSlots.viewport({ class: ui?.viewport })"
      @mouseleave="emit('leaveDates')"
    >
      <div :class="calendarSlots.previousMonth({ class: ui?.previousMonth })">
        <KButton
          :label="previousMonthLabel"
          variant="ghost"
          color="gray"
          size="sm"
          :leading-icon="ChevronLeft"
          square
          :pill="false"
          :disabled="!canShowPreviousMonth"
          @click="showPreviousMonth"
        />
      </div>
      <div :class="calendarSlots.nextMonth({ class: ui?.nextMonth })">
        <KButton
          :label="nextMonthLabel"
          variant="ghost"
          color="gray"
          size="sm"
          :leading-icon="ChevronRight"
          square
          :pill="false"
          :disabled="!canShowNextMonth"
          @click="showNextMonth"
        />
      </div>

      <div
        :key="carouselResetCount"
        :style="{ transform: `translateX(${-carouselStep * carouselMonthStride}px)` }"
        :class="calendarSlots.monthTrack({ class: ui?.monthTrack })"
      >
        <TransitionGroup :duration="400" leave-active-class="pointer-events-none" @before-leave="markLeavingMonth">
          <div
            v-for="visibleMonth in visibleMonths"
            :key="visibleMonth.calendarMonth.isoMonth"
            data-calendar-month
            :style="{ left: `${visibleMonth.carouselPosition * carouselMonthStride}px` }"
            :class="calendarSlots.month({ class: [visibleMonth.monthOffset > 0 && 'max-sm:hidden', ui?.month] })"
          >
            <DateCalendarMonth
              :calendar-month="visibleMonth.calendarMonth"
              :weekdays="weekdays"
              :selected-start="selectedStart"
              :selected-end="selectedEnd"
              :tabbable-date="tabbableDate"
              :today="today"
              :is-date-unavailable="isDateUnavailable"
              :weekday-label="weekdayLabel"
              :month-label="monthLabel"
              :day-label="dayLabel"
              :ui="ui"
              @select-date="selectDate"
              @hover-date="emit('hoverDate', $event)"
              @keydown-date="moveFocusFromKeyboard"
            />
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>
