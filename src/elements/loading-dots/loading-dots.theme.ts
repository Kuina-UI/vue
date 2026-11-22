import { tv } from '../../shared/utils/tv'

export const loadingDotsTheme = tv({
  slots: {
    base: 'flex loading-dots h-lh items-center gap-1',
  },
})

export type LoadingDotsSlotName = keyof ReturnType<typeof loadingDotsTheme>
