import { tv, type VariantProps } from '../../shared/utils/tv'

const uncheckedIndicatorRing =
  'inset-ring light:inset-ring-stone-950/16 dark:inset-ring-stone-200/25 light:group-focus/menu-item:inset-ring-stone-950/25'

export const menuTheme = tv({
  slots: {
    root: 'inline-flex h-fit',
    panel:
      'z-10 rounded-xl border border-line bg-widget p-1.5 text-left text-sm leading-5 font-normal shadow-lg outline-hidden transition duration-350 ease-[cubic-bezier(0.19,1,0.22,1)] starting:scale-95 starting:opacity-0',
    separator: '-mx-1.5 my-1.5 h-px bg-line',
    groupLabel: 'px-2 py-1.5 text-muted',
    header: 'px-2 py-1.5',
    headerLabel: 'truncate font-medium',
    headerDescription: 'truncate text-muted',
    item: 'group/menu-item relative flex w-full rounded-md px-2 py-1.5 outline-hidden select-none before:absolute before:inset-0 before:rounded-md before:transition before:duration-150 before:ease-[cubic-bezier(0.19,1,0.22,1)] light:before:bg-stone-950/8 dark:before:bg-stone-200/10',
    itemContent: 'relative flex min-w-0 flex-1 items-start',
    itemIcon: 'my-px size-4.5 shrink-0 stroke-[1.5px]',
    itemText: 'min-w-0 flex-1',
    itemLabel: 'block truncate',
    itemDescription: 'block truncate text-muted',
    itemShortcut: 'shrink-0 pl-2 font-sans text-muted',
    indicatorWrapper: 'flex h-5 shrink-0 items-center',
    indicator: 'flex size-4.5 items-center justify-center',
    indicatorCheckIcon: '',
    radioDot:
      'size-2 rounded-full transition-transform duration-400 ease-[cubic-bezier(0.19,1,0.22,1)] dark:bg-stone-950 starting:scale-0 light:bg-white',
    newTabHint: 'sr-only',
  },
  variants: {
    side: {
      top: '',
      bottom: '',
    },
    align: {
      start: '',
      center: '',
      end: '',
    },
    width: {
      trigger: { panel: 'w-(--floating-anchor-width)' },
      auto: { panel: 'w-max max-w-80' },
      sm: { panel: 'w-48' },
      md: { panel: 'w-56' },
      lg: { panel: 'w-64' },
      xl: { panel: 'w-72' },
    },
    indicatorPosition: {
      start: '',
      end: { indicatorWrapper: 'order-last' },
    },
    indicatorVariant: {
      solid: { indicator: 'rounded-full transition-shadow', indicatorCheckIcon: 'size-3.5' },
      ghost: { indicatorCheckIcon: 'size-4' },
    },
    color: {
      danger: {
        item: 'light:text-red-600 dark:text-red-400 light:before:bg-red-600/8 dark:before:bg-red-400/12',
      },
    },
    type: {
      checkbox: '',
      radio: { indicator: 'rounded-full transition-shadow' },
    },
    checked: {
      true: '',
      false: '',
    },
    disabled: {
      true: { item: 'cursor-not-allowed opacity-50 before:hidden' },
      false: {
        item: 'cursor-pointer before:scale-98 before:opacity-0 focus:before:scale-100 focus:before:opacity-100 active:before:scale-98',
      },
    },
    hasIndicator: {
      true: { itemContent: 'gap-2' },
      false: { itemContent: 'gap-1.5' },
    },
  },
  compoundVariants: [
    { side: 'bottom', align: 'start', class: { panel: 'origin-top-left' } },
    { side: 'bottom', align: 'center', class: { panel: 'origin-top' } },
    { side: 'bottom', align: 'end', class: { panel: 'origin-top-right' } },
    { side: 'top', align: 'start', class: { panel: 'origin-bottom-left' } },
    { side: 'top', align: 'center', class: { panel: 'origin-bottom' } },
    { side: 'top', align: 'end', class: { panel: 'origin-bottom-right' } },
    { type: 'radio', checked: false, class: { indicator: uncheckedIndicatorRing } },
    { type: 'radio', checked: true, class: { indicator: 'light:bg-neutral-900 dark:bg-stone-200' } },
    {
      type: 'checkbox',
      indicatorVariant: 'solid',
      checked: false,
      class: { indicator: uncheckedIndicatorRing },
    },
    {
      type: 'checkbox',
      indicatorVariant: 'solid',
      checked: true,
      class: { indicator: 'light:bg-neutral-900 light:text-white dark:bg-stone-200 dark:text-stone-950' },
    },
  ],
  defaultVariants: {
    side: 'bottom',
    align: 'start',
    width: 'md',
    indicatorPosition: 'end',
    indicatorVariant: 'solid',
    checked: false,
    disabled: false,
    hasIndicator: false,
  },
})

export type MenuThemeVariants = VariantProps<typeof menuTheme>

export type MenuSlotName = keyof ReturnType<typeof menuTheme>
