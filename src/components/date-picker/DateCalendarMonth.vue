<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarDay, CalendarMonth, Weekday } from '../../shared/types/calendar'
import type { ClassNameValue } from '../../shared/utils/tv'
import { type DateCalendarSlotName, dateCalendarDayTheme, dateCalendarTheme } from './date-calendar.theme'

const props = defineProps<{
  calendarMonth: CalendarMonth
  weekdays: Weekday[]
  selectedStart?: string
  selectedEnd?: string
  tabbableDate: string
  today: string
  isDateUnavailable: (isoDate: string) => boolean
  weekdayLabel: (weekday: Weekday) => string
  monthLabel: (isoMonth: string) => string
  dayLabel: (isoDate: string) => string
  ui?: Partial<Record<DateCalendarSlotName, ClassNameValue>>
}>()

const emit = defineEmits<{
  selectDate: [isoDate: string]
  hoverDate: [isoDate: string]
  keydownDate: [keyboardEvent: KeyboardEvent, isoDate: string]
}>()

const lastWeekdayColumn = 6

const calendarSlots = computed(() => dateCalendarTheme())

function findRangeStartEdge(calendarDay: CalendarDay, isRangeStart: boolean, weekdayColumn: number) {
  if (isRangeStart) return 'round'
  return calendarDay.dayNumber === 1 && weekdayColumn !== 0 ? 'fade' : 'square'
}

function findRangeEndEdge(calendarDay: CalendarDay, isRangeEnd: boolean, weekdayColumn: number) {
  if (isRangeEnd) return 'round'
  return calendarDay.isoDate === props.calendarMonth.lastIsoDate && weekdayColumn !== lastWeekdayColumn
    ? 'fade'
    : 'square'
}

const calendarWeeks = computed(() => {
  const { selectedStart, selectedEnd } = props
  const hasRange = Boolean(selectedStart && selectedEnd) && selectedStart !== selectedEnd

  return props.calendarMonth.weeks.map((week) =>
    week.map((calendarDay, weekdayColumn) => {
      if (!calendarDay) return { cellKey: `empty-${weekdayColumn}`, calendarDay: null }

      const { isoDate } = calendarDay
      const isUnavailable = props.isDateUnavailable(isoDate)
      const isRangeStart = !isUnavailable && isoDate === selectedStart
      const isRangeEnd = !isUnavailable && isoDate === selectedEnd
      const isInRange = hasRange && isoDate >= (selectedStart as string) && isoDate <= (selectedEnd as string)

      return {
        cellKey: isoDate,
        calendarDay,
        isUnavailable,
        isSelected: isRangeStart || isRangeEnd,
        isToday: isoDate === props.today,
        daySlots: dateCalendarDayTheme({
          selected: isRangeStart || isRangeEnd,
          inRange: isInRange,
          rangeStartEdge: isInRange ? findRangeStartEdge(calendarDay, isRangeStart, weekdayColumn) : undefined,
          rangeEndEdge: isInRange ? findRangeEndEdge(calendarDay, isRangeEnd, weekdayColumn) : undefined,
        }),
      }
    }),
  )
})

function selectAvailableDate(isoDate: string) {
  if (!props.isDateUnavailable(isoDate)) emit('selectDate', isoDate)
}

function hoverAvailableDate(isoDate: string) {
  if (!props.isDateUnavailable(isoDate)) emit('hoverDate', isoDate)
}
</script>

<template>
  <div>
    <p :class="calendarSlots.monthLabel({ class: ui?.monthLabel })">{{ monthLabel(calendarMonth.isoMonth) }}</p>

    <div :class="calendarSlots.weeks({ class: ui?.weeks })">
      <div aria-hidden="true" :class="calendarSlots.weekdays({ class: ui?.weekdays })">
        <div v-for="weekday in weekdays" :key="weekday" :class="calendarSlots.weekday({ class: ui?.weekday })">
          {{ weekdayLabel(weekday) }}
        </div>
      </div>

      <div v-for="(week, weekIndex) in calendarWeeks" :key="weekIndex" :class="calendarSlots.week({ class: ui?.week })">
        <template v-for="weekCell in week" :key="weekCell.cellKey">
          <div v-if="!weekCell.calendarDay" :class="calendarSlots.emptyDay({ class: ui?.emptyDay })" />
          <div v-else :class="weekCell.daySlots.dayCell({ class: ui?.dayCell })">
            <button
              type="button"
              :data-iso-date="weekCell.calendarDay.isoDate"
              :tabindex="weekCell.calendarDay.isoDate === tabbableDate ? 0 : -1"
              :aria-label="dayLabel(weekCell.calendarDay.isoDate)"
              :aria-pressed="weekCell.isSelected || undefined"
              :aria-current="weekCell.isToday ? 'date' : undefined"
              :aria-disabled="weekCell.isUnavailable || undefined"
              :class="weekCell.daySlots.day({ class: ui?.day })"
              @click="selectAvailableDate(weekCell.calendarDay.isoDate)"
              @mouseenter="hoverAvailableDate(weekCell.calendarDay.isoDate)"
              @focus="hoverAvailableDate(weekCell.calendarDay.isoDate)"
              @keydown="emit('keydownDate', $event, weekCell.calendarDay.isoDate)"
            >
              {{ weekCell.calendarDay.dayNumber }}
              <span v-if="weekCell.isToday" :class="weekCell.daySlots.todayIndicator({ class: ui?.todayIndicator })" />
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
