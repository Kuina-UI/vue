import { tv, type VariantProps } from '../../shared/utils/tv'

export const sliderTheme = tv({
  slots: {
    root: 'group/slider w-full',
    header: 'mb-2 flex items-center justify-between gap-1 text-sm',
    label: 'flex-1',
    reset: 'invisible flex opacity-0 transition-[visibility,opacity] delay-[250ms,0ms] duration-[0ms,250ms] ease-[ease]',
    resetButton: '',
    value:
      '-mr-1 flex h-6.5 items-baseline justify-end gap-0.5 rounded-md border-[0.5px] border-transparent px-1 text-center transition-[border-color] duration-250 ease-[ease] focus-within:border-primary md:h-5.5',
    valueInput:
      'field-sizing-content h-full w-[calc(var(--slider-value-length)*1ch+1px)] min-w-[1ch] text-left text-base tabular-nums outline-hidden supports-[field-sizing:content]:w-auto md:text-[13px]',
    unit: 'text-xs text-muted select-none',
    valueSeparator: 'px-0.5 text-base select-none md:text-[13px]',
  },
  variants: {
    disabled: {
      true: { root: 'opacity-50', value: 'cursor-not-allowed', valueInput: 'cursor-not-allowed' },
      false: {
        value:
          'cursor-text dark:group-hover/slider:not-focus-within:border-white/20 light:group-hover/slider:not-focus-within:border-stone-950/20',
      },
    },
    hidesResetButton: {
      true: { resetButton: 'cursor-default' },
      false: {
        reset:
          'group-hover/slider:visible group-hover/slider:opacity-100 group-hover/slider:delay-0 group-has-focus-visible/slider:visible group-has-focus-visible/slider:opacity-100 group-has-focus-visible/slider:delay-0',
      },
    },
  },
  defaultVariants: {
    disabled: false,
    hidesResetButton: true,
  },
})

export type SliderThemeVariants = VariantProps<typeof sliderTheme>

export type SliderSlotName = keyof ReturnType<typeof sliderTheme>
