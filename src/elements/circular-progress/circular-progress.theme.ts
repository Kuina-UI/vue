import { tv } from '../../shared/utils/tv'

export const circularProgressTheme = tv({
  slots: {
    base: 'size-7 -rotate-90 fill-none stroke-2',
    track: 'stroke-primary/15',
    indicator: 'stroke-primary transition-[stroke-dashoffset] duration-300',
  },
})

export type CircularProgressSlotName = keyof ReturnType<typeof circularProgressTheme>
