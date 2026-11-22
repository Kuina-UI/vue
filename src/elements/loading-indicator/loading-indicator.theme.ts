import { tv } from '../../shared/utils/tv'

export const loadingIndicatorTheme = tv({
  slots: {
    base: 'loading-indicator',
  },
})

export type LoadingIndicatorSlotName = keyof ReturnType<typeof loadingIndicatorTheme>
