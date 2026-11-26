import { tv } from '../../shared/utils/tv'

export const datePickerTheme = tv({
  slots: {
    panel: 'z-10 flex rounded-xl border border-line bg-widget shadow-lg outline-hidden',
    selectionText: '',
    shortcuts: 'flex w-37.5 shrink-0 flex-col gap-1 border-r border-line p-2 max-md:hidden',
    shortcutLabel: 'flex w-full items-center justify-between gap-2 text-left font-normal',
    shortcutCheckIcon: 'size-4 shrink-0',
  },
  variants: {
    tabularSelection: {
      true: { selectionText: 'tabular-nums' },
    },
    activeShortcut: {
      true: { shortcutLabel: 'font-semibold' },
    },
  },
})

export type DatePickerSlotName = keyof ReturnType<typeof datePickerTheme>
