import { tv, type VariantProps } from '../../shared/utils/tv'

export const checkboxTheme = tv({
  slots: {
    root: 'flex cursor-pointer items-start gap-x-2 text-sm leading-5',
    base: 'relative top-px size-4.5 shrink-0 rounded-sm border outline-primary transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 light:border-stone-300 light:not-has-checked:hover:border-stone-400 dark:border-stone-600 dark:not-has-checked:hover:border-stone-500',
    checkMark: 'checkbox-check-mark hidden peer-checked:block light:text-white dark:text-stone-950',
  },
  variants: {
    color: {
      primary: { base: 'has-checked:border-primary has-checked:bg-primary' },
      secondary: { base: 'has-checked:border-secondary has-checked:bg-secondary' },
      neutral: {
        base: 'light:has-checked:border-neutral-900 light:has-checked:bg-neutral-900 dark:has-checked:border-stone-200 dark:has-checked:bg-stone-200',
      },
    },
    labelPosition: {
      start: { root: 'flex-row-reverse justify-end' },
      end: '',
    },
  },
})

export type CheckboxThemeVariants = VariantProps<typeof checkboxTheme>

export type CheckboxSlotName = keyof ReturnType<typeof checkboxTheme>
