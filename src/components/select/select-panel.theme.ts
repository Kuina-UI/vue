import { tv, type VariantProps } from '../../shared/utils/tv'

export const selectPanelTheme = tv({
  slots: {
    panel:
      'z-10 flex max-h-100 w-(--floating-anchor-width) min-w-64 flex-col rounded-xl border border-line bg-widget text-sm leading-5 shadow-lg',
    search: 'relative border-b border-line',
    searchIcon: 'pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted',
    searchInput: 'h-10 w-full bg-transparent pr-3 pl-8.5 outline-hidden placeholder:text-muted',
    optionList: 'flex-1 overflow-auto p-1.5',
    group: 'not-first:mt-1.5',
    groupLabel: 'px-2 py-1.5 text-muted',
    option: 'flex gap-1 rounded-md px-2 py-1.5 wrap-anywhere',
    optionIndicator: 'flex h-5 w-4 shrink-0 items-center',
    optionCheckIcon: 'size-4',
    optionAvatar: 'mr-1 flex shrink-0',
    optionText: 'min-w-0',
    optionLabel: 'block',
    optionDescription: 'block font-normal text-muted',
    noResults: 'my-4 px-2 py-1.5 text-center text-muted',
    actions: 'border-t border-line p-1.5',
    action:
      'flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-left outline-primary focus-visible:outline-2',
    actionIcon: 'size-4 shrink-0',
  },
  variants: {
    optionSelected: {
      true: { option: 'font-semibold' },
    },
    optionDisabled: {
      true: { option: 'cursor-not-allowed opacity-50' },
      false: { option: 'cursor-pointer' },
    },
    highlighted: {
      true: { option: 'light:bg-stone-950/8 dark:bg-stone-200/10', action: 'light:bg-stone-950/8 dark:bg-stone-200/10' },
    },
    optionLayout: {
      text: { option: 'items-start' },
      avatar: { option: 'items-center', optionAvatar: '-my-0.5' },
      avatarWithDescription: { option: 'items-center' },
    },
  },
})

export type SelectPanelThemeVariants = VariantProps<typeof selectPanelTheme>

export type SelectPanelSlotName = keyof ReturnType<typeof selectPanelTheme>
