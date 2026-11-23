import { tv, type VariantProps } from '../../shared/utils/tv'

export const textLinkTheme = tv({
  slots: {
    base: 'rounded-sm wrap-anywhere outline-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-1',
    leadingIcon: 'size-[1em] shrink-0',
    trailingIcon: 'size-[1em] shrink-0',
    newTabHint: 'sr-only',
  },
  variants: {
    color: {
      inherit: { base: 'hover:text-current/80' },
      muted: { base: 'text-muted light:hover:text-stone-950 dark:hover:text-white' },
      primary: {
        base: 'text-primary light:hover:text-[color-mix(in_oklab,var(--color-primary),black_25%)] dark:hover:text-[color-mix(in_oklab,var(--color-primary),white_25%)]',
      },
    },
    weight: {
      inherit: '',
      medium: { base: 'font-medium' },
      semibold: { base: 'font-semibold' },
    },
    underline: {
      true: { base: 'underline decoration-current/70 underline-offset-[0.1em]' },
    },
    hasIcon: {
      true: { base: 'inline-flex items-center gap-0.5' },
    },
  },
})

export type TextLinkThemeVariants = VariantProps<typeof textLinkTheme>

export type TextLinkSlotName = keyof ReturnType<typeof textLinkTheme>
