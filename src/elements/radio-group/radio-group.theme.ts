import { tv, type VariantProps } from '../../shared/utils/tv'

export const radioGroupTheme = tv({
  slots: {
    root: 'min-w-0',
    legend: '',
    optionList: '',
    option: 'items-start text-sm leading-5',
    container: 'flex h-5 shrink-0 items-center',
    base: 'relative flex size-4 items-center justify-center rounded-full border outline-primary transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2',
    indicator:
      'hidden size-1.5 rounded-full transition-transform duration-600 ease-[cubic-bezier(0.19,1,0.22,1)] peer-checked:block starting:scale-0 light:bg-white dark:bg-stone-950',
    wrapper: '',
    label: 'block font-medium',
    description: 'mt-0.5 block text-muted',
    errorMessage: 'mt-3 flex items-start gap-x-1.5 text-xs light:text-red-600 dark:text-red-400',
    errorIcon: 'mt-px size-3.5 shrink-0',
  },
  variants: {
    variant: {
      default: { option: 'inline-flex' },
      card: { option: 'flex w-full gap-x-2.5 rounded-2xl border p-4 transition-colors' },
    },
    direction: {
      row: '',
      col: '',
    },
    color: {
      primary: { base: 'has-checked:border-primary has-checked:bg-primary' },
      secondary: { base: 'has-checked:border-secondary has-checked:bg-secondary' },
      neutral: {
        base: 'light:has-checked:border-neutral-900 light:has-checked:bg-neutral-900 dark:has-checked:border-stone-200 dark:has-checked:bg-stone-200',
      },
    },
    hideLabel: {
      true: { legend: 'sr-only' },
      false: { legend: 'mb-3 text-sm font-semibold' },
    },
    hasDescriptions: {
      true: '',
    },
    invalid: {
      true: { base: 'light:border-red-600 dark:border-red-500' },
    },
    optionDisabled: {
      true: { option: 'cursor-not-allowed opacity-50' },
      false: { option: 'cursor-pointer' },
    },
    optionHasDescription: {
      true: '',
    },
  },
  compoundVariants: [
    { variant: 'card', direction: 'row', class: { optionList: 'grid gap-3 sm:auto-cols-fr sm:grid-flow-col' } },
    { variant: 'card', direction: 'col', class: { optionList: 'flex flex-col gap-y-3' } },
    { variant: 'default', direction: 'row', class: { optionList: 'flex flex-wrap gap-x-5 gap-y-2.5' } },
    {
      variant: 'default',
      direction: 'col',
      hasDescriptions: true,
      class: { optionList: 'flex flex-col items-start gap-y-4' },
    },
    {
      variant: 'default',
      direction: 'col',
      hasDescriptions: false,
      class: { optionList: 'flex flex-col items-start gap-y-2.5' },
    },
    { variant: 'default', optionHasDescription: true, class: { option: 'gap-x-2.5' } },
    { variant: 'default', optionHasDescription: false, class: { option: 'gap-x-1.5' } },
    { variant: 'card', color: 'primary', class: { option: 'has-checked:border-primary' } },
    { variant: 'card', color: 'secondary', class: { option: 'has-checked:border-secondary' } },
    {
      variant: 'card',
      color: 'neutral',
      class: { option: 'light:has-checked:border-neutral-900 dark:has-checked:border-stone-200' },
    },
    { variant: 'card', invalid: true, class: { option: 'light:border-red-600 dark:border-red-500' } },
    { variant: 'card', invalid: false, optionDisabled: true, class: { option: 'border-line' } },
    {
      variant: 'card',
      invalid: false,
      optionDisabled: false,
      class: {
        option: 'border-line light:not-has-checked:hover:border-stone-950/20 dark:not-has-checked:hover:border-white/20',
      },
    },
    { invalid: false, optionDisabled: true, class: { base: 'light:border-stone-300 dark:border-stone-600' } },
    {
      invalid: false,
      optionDisabled: false,
      class: {
        base: 'light:border-stone-300 light:not-has-checked:hover:border-stone-400 dark:border-stone-600 dark:not-has-checked:hover:border-stone-500',
      },
    },
  ],
})

export type RadioGroupThemeVariants = VariantProps<typeof radioGroupTheme>

export type RadioGroupSlotName = keyof ReturnType<typeof radioGroupTheme>
