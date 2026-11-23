import { tv, type VariantProps } from '../../shared/utils/tv'

export const switchTheme = tv({
  slots: {
    root: 'flex items-start text-sm leading-5 select-none',
    base: 'relative h-4.75 w-8 shrink-0 rounded-full outline-primary transition-colors duration-250 ease-[cubic-bezier(0.65,0,0.35,1)] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 light:bg-stone-200 dark:bg-stone-700',
    thumb:
      'absolute top-0.75 left-0.75 size-3.25 rounded-full bg-white transition duration-250 ease-[cubic-bezier(0.65,0,0.35,1)] peer-checked:translate-x-3.25 dark:peer-checked:bg-stone-950',
    wrapper: 'min-w-0',
    label: 'block font-medium',
    description: 'mt-0.5 block text-muted',
  },
  variants: {
    color: {
      primary: { base: 'has-checked:bg-primary' },
      secondary: { base: 'has-checked:bg-secondary' },
      neutral: { base: 'light:has-checked:bg-neutral-900 dark:has-checked:bg-stone-200' },
    },
    labelPosition: {
      start: { root: 'flex-row-reverse' },
      end: '',
    },
    block: {
      true: { root: 'w-full justify-between gap-x-4' },
      false: { root: 'w-fit gap-x-2' },
    },
    disabled: {
      true: { root: 'cursor-not-allowed opacity-50' },
      false: {
        root: 'cursor-pointer',
        base: 'light:not-has-checked:hover:bg-stone-300 dark:not-has-checked:hover:bg-stone-600',
        thumb: 'shadow-[0_1px_2px_rgb(0_0_0/20%)]',
      },
    },
    hasLabel: {
      true: { base: 'top-px' },
    },
  },
})

export type SwitchThemeVariants = VariantProps<typeof switchTheme>

export type SwitchSlotName = keyof ReturnType<typeof switchTheme>
