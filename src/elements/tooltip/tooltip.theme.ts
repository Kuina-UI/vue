import { tv, type VariantProps } from '../../shared/utils/tv'

export const tooltipTheme = tv({
  slots: {
    base: 'z-10 w-max rounded-lg text-left text-sm/[1.45] font-normal whitespace-normal shadow-lg',
    trigger: 'cursor-pointer underline decoration-dotted outline-none',
  },
  variants: {
    gutterSize: {
      sm: '',
      md: '',
      lg: '',
    },
    compact: {
      true: { base: 'px-2 py-0.5 light:bg-neutral-800 light:text-white dark:bg-stone-400 dark:text-stone-950' },
      false: { base: 'border border-line bg-widget' },
    },
    open: {
      true: { trigger: 'decoration-muted' },
      false: { trigger: 'decoration-transparent' },
    },
  },
  compoundVariants: [
    { compact: false, gutterSize: 'sm', class: { base: 'px-3 py-2' } },
    { compact: false, gutterSize: 'md', class: { base: 'px-4 py-3' } },
    { compact: false, gutterSize: 'lg', class: { base: 'px-4.5 py-3.5' } },
  ],
  defaultVariants: {
    gutterSize: 'md',
    compact: false,
    open: false,
  },
})

export type TooltipThemeVariants = VariantProps<typeof tooltipTheme>

export type TooltipSlotName = keyof ReturnType<typeof tooltipTheme>
