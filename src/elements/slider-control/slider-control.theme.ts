import { tv, type VariantProps } from '../../shared/utils/tv'

export const sliderControlTheme = tv({
  slots: {
    root: 'relative w-full [--slider-thumb-size:14px]',
    control:
      'relative flex w-full touch-none items-center pb-1.5 select-none dark:[--slider-range-color:var(--color-stone-400)] dark:[--slider-track-color:var(--color-stone-700)] light:[--slider-range-color:var(--color-stone-500)] light:[--slider-track-color:var(--color-stone-200)]',
    track: 'relative h-1 w-full grow rounded-xs bg-(--slider-track-color)',
    range:
      'absolute h-full rounded-xs bg-(--slider-range-color) transition-[left,right] duration-(--slider-value-transition-duration) ease-[cubic-bezier(0.65,0,0.35,1)]',
    thumbAnchor:
      'absolute -translate-x-1/2 transition-[left] duration-(--slider-value-transition-duration) ease-[cubic-bezier(0.65,0,0.35,1)]',
    thumb:
      'block size-3.5 rounded-full inset-ring-2 inset-ring-(--slider-range-color) outline-primary focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-stone-950 light:bg-white',
    marks: '@container mt-1 grid',
    mark: 'col-start-1 row-start-1 slider-mark-position justify-self-start text-xs font-normal',
    markLabel: 'inline-block text-center wrap-break-word',
  },
  variants: {
    disabled: {
      true: { control: 'cursor-not-allowed', thumb: 'cursor-not-allowed' },
      false: { thumb: 'cursor-grab active:cursor-grabbing' },
    },
    isActiveThumb: {
      true: { thumbAnchor: 'z-1' },
    },
    marksLayout: {
      inline: '',
      wrapped: { mark: 'w-min' },
      hidden: { mark: 'hidden' },
    },
  },
  defaultVariants: {
    disabled: false,
    marksLayout: 'inline',
  },
})

export type SliderControlThemeVariants = VariantProps<typeof sliderControlTheme>

export type SliderControlSlotName = keyof ReturnType<typeof sliderControlTheme>
