import { tv, type VariantProps } from '../../shared/utils/tv'

export const avatarGroupTheme = tv({
  slots: {
    base: 'flex *:ring-3',
  },
  variants: {
    stack: {
      start: { base: 'flex-row-reverse justify-end *:not-first:-me-[calc(var(--avatar-size)/4)]' },
      end: { base: '*:not-first:-ms-[calc(var(--avatar-size)/4)]' },
    },
    surface: {
      widget: { base: '*:ring-widget' },
      canvas: { base: '*:ring-canvas' },
    },
    hasOverflow: {
      true: '',
    },
  },
  compoundVariants: [{ stack: 'start', hasOverflow: true, class: { base: '*:first:z-10' } }],
})

export type AvatarGroupThemeVariants = VariantProps<typeof avatarGroupTheme>

export type AvatarGroupSlotName = keyof ReturnType<typeof avatarGroupTheme>
