import { tv, type VariantProps } from '../../shared/utils/tv'

const monthSlideEasing = 'ease-[cubic-bezier(0.65,0,0.35,1)]'

export const dateCalendarTheme = tv({
  slots: {
    calendar: 'overflow-hidden px-3 pt-2.5 pb-3',
    viewport: 'relative',
    previousMonth:
      'absolute top-0 -left-0.5 z-10 bg-widget before:absolute before:inset-y-0 before:-left-2.5 before:w-3 before:bg-widget after:pointer-events-none after:absolute after:inset-y-0 after:left-full after:w-3.5 after:bg-linear-to-r after:from-widget',
    nextMonth:
      'absolute top-0 -right-0.5 z-10 bg-widget before:absolute before:inset-y-0 before:-right-2.5 before:w-3 before:bg-widget after:pointer-events-none after:absolute after:inset-y-0 after:right-full after:w-3.5 after:bg-linear-to-l after:from-widget',
    monthTrack: ['transition-transform duration-250 motion-reduce:transition-none', monthSlideEasing],
    month: 'absolute top-0 w-52.5 text-sm',
    monthLabel: 'mb-1.5 flex h-7 items-center justify-center text-[13px] font-semibold',
    weeks: 'flex flex-col gap-0.5',
    weekdays: 'flex',
    weekday: 'flex size-7.5 items-center justify-center text-xs text-muted',
    week: 'flex',
    emptyDay: 'size-7.5',
  },
  variants: {
    showsTwoMonths: {
      true: { viewport: 'w-52.5 sm:w-113' },
      false: { viewport: 'w-52.5' },
    },
    animatesHeight: {
      true: { viewport: ['transition-[height] duration-250 motion-reduce:transition-none', monthSlideEasing] },
    },
  },
})

export const dateCalendarDayTheme = tv({
  slots: {
    dayCell: 'relative size-7.5 transition-colors duration-150',
    day: 'relative block size-7.5 cursor-pointer rounded-full outline-primary transition-[color,background-color,box-shadow] duration-150 focus-visible:outline-2 not-aria-disabled:hover:inset-ring aria-disabled:cursor-not-allowed aria-disabled:opacity-40',
    todayIndicator: 'absolute bottom-0.75 left-1/2 size-0.75 -translate-x-1/2 rounded-full bg-current',
  },
  variants: {
    selected: {
      true: { day: 'light:bg-neutral-900 light:text-white dark:bg-stone-200 dark:text-stone-950' },
    },
    inRange: {
      true: { dayCell: 'light:bg-stone-950/6 dark:bg-stone-200/8' },
    },
    rangeStartEdge: {
      round: { dayCell: 'rounded-l-full' },
      fade: {
        dayCell:
          'before:absolute before:inset-y-0 before:right-full before:w-3.75 before:bg-linear-to-l before:transition-opacity before:duration-150 light:before:from-stone-950/6 dark:before:from-stone-200/8 starting:before:opacity-0',
      },
      square: { dayCell: 'first:rounded-l-sm' },
    },
    rangeEndEdge: {
      round: { dayCell: 'rounded-r-full' },
      fade: {
        dayCell:
          'before:absolute before:inset-y-0 before:left-full before:w-3.75 before:bg-linear-to-r before:transition-opacity before:duration-150 light:before:from-stone-950/6 dark:before:from-stone-200/8 starting:before:opacity-0',
      },
      square: { dayCell: 'last:rounded-r-sm' },
    },
  },
})

export type DateCalendarDayThemeVariants = VariantProps<typeof dateCalendarDayTheme>

export type DateCalendarSlotName =
  | keyof ReturnType<typeof dateCalendarTheme>
  | keyof ReturnType<typeof dateCalendarDayTheme>
