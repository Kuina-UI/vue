export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type DateRange = [start: string, end: string]

export type DateOrDateRange = string | DateRange

export interface CalendarDay {
  isoDate: string
  dayNumber: number
  weekday: Weekday
}

export interface CalendarMonth {
  isoMonth: string
  firstIsoDate: string
  lastIsoDate: string
  weeks: (CalendarDay | null)[][]
}
