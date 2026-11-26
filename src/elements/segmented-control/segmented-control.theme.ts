import { tv, type VariantProps } from '../../shared/utils/tv'

interface SegmentedControlSizeScale {
  height: string
  fontSize: string
  radius: string
  optionRadius: string
  gutter: string
  pillGutter: string
  squareWidth: string
  contentGap: string
  iconSize: string
}

const segmentedControlSizeScales = {
  '3xs': {
    height: 'h-5.5',
    fontSize: 'text-xs/none',
    radius: 'rounded-md',
    optionRadius: 'rounded-sm',
    gutter: 'px-2',
    pillGutter: 'px-2.75',
    squareWidth: 'w-4.5',
    contentGap: 'gap-0.75',
    iconSize: 'size-3.5',
  },
  '2xs': {
    height: 'h-6',
    fontSize: 'text-xs/none',
    radius: 'rounded-md',
    optionRadius: 'rounded-sm',
    gutter: 'px-2',
    pillGutter: 'px-2.75',
    squareWidth: 'w-5',
    contentGap: 'gap-1',
    iconSize: 'size-4',
  },
  'xs': {
    height: 'h-6.5',
    fontSize: 'text-sm/none',
    radius: 'rounded-md',
    optionRadius: 'rounded-sm',
    gutter: 'px-2',
    pillGutter: 'px-2.75',
    squareWidth: 'w-5.5',
    contentGap: 'gap-1',
    iconSize: 'size-4',
  },
  'sm': {
    height: 'h-7',
    fontSize: 'text-sm/none',
    radius: 'rounded-lg',
    optionRadius: 'rounded-md',
    gutter: 'px-2.5',
    pillGutter: 'px-3.25',
    squareWidth: 'w-6',
    contentGap: 'gap-1',
    iconSize: 'size-4.5',
  },
  'md': {
    height: 'h-8',
    fontSize: 'text-sm/none',
    radius: 'rounded-lg',
    optionRadius: 'rounded-md',
    gutter: 'px-3',
    pillGutter: 'px-4',
    squareWidth: 'w-7',
    contentGap: 'gap-1.5',
    iconSize: 'size-4.5',
  },
  'lg': {
    height: 'h-9',
    fontSize: 'text-sm/none',
    radius: 'rounded-lg',
    optionRadius: 'rounded-md',
    gutter: 'px-3',
    pillGutter: 'px-4',
    squareWidth: 'w-8',
    contentGap: 'gap-1.5',
    iconSize: 'size-4.5',
  },
  'xl': {
    height: 'h-10',
    fontSize: 'text-sm/none',
    radius: 'rounded-[10px]',
    optionRadius: 'rounded-lg',
    gutter: 'px-3.5',
    pillGutter: 'px-4.75',
    squareWidth: 'w-9',
    contentGap: 'gap-1.5',
    iconSize: 'size-4.5',
  },
  '2xl': {
    height: 'h-11',
    fontSize: 'text-base/none',
    radius: 'rounded-xl',
    optionRadius: 'rounded-[10px]',
    gutter: 'px-4',
    pillGutter: 'px-5.25',
    squareWidth: 'w-10',
    contentGap: 'gap-1.5',
    iconSize: 'size-5',
  },
  '3xl': {
    height: 'h-12',
    fontSize: 'text-base/none',
    radius: 'rounded-xl',
    optionRadius: 'rounded-[10px]',
    gutter: 'px-4',
    pillGutter: 'px-5.25',
    squareWidth: 'w-11',
    contentGap: 'gap-1.5',
    iconSize: 'size-5',
  },
  '4xl': {
    height: 'h-14',
    fontSize: 'text-base/none',
    radius: 'rounded-2xl',
    optionRadius: 'rounded-[14px]',
    gutter: 'px-4.5',
    pillGutter: 'px-6',
    squareWidth: 'w-13',
    contentGap: 'gap-3',
    iconSize: 'size-6',
  },
} satisfies Record<string, SegmentedControlSizeScale>

type SegmentedControlSizeName = keyof typeof segmentedControlSizeScales

const segmentedControlSizeNames = Object.keys(segmentedControlSizeScales) as SegmentedControlSizeName[]

function createSizeVariant(sizeScale: SegmentedControlSizeScale) {
  return {
    root: [sizeScale.height, sizeScale.fontSize],
    content: sizeScale.contentGap,
    icon: sizeScale.iconSize,
  }
}

function createShapeCompounds(sizeName: SegmentedControlSizeName) {
  const sizeScale = segmentedControlSizeScales[sizeName]

  return [
    { size: sizeName, square: false, pill: true, class: { option: sizeScale.pillGutter } },
    { size: sizeName, square: false, pill: false, class: { option: sizeScale.gutter } },
    { size: sizeName, square: true, block: false, class: { option: sizeScale.squareWidth } },
    {
      size: sizeName,
      pill: false,
      class: { root: sizeScale.radius, thumb: sizeScale.optionRadius, option: sizeScale.optionRadius },
    },
  ]
}

const segmentedControlSizeVariants = Object.fromEntries(
  segmentedControlSizeNames.map((sizeName) => [sizeName, createSizeVariant(segmentedControlSizeScales[sizeName])]),
) as Record<SegmentedControlSizeName, ReturnType<typeof createSizeVariant>>

export const segmentedControlTheme = tv({
  slots: {
    root: 'relative gap-0.5 p-0.5 font-semibold whitespace-nowrap select-none light:bg-stone-950/6 dark:bg-stone-950/40',
    thumb:
      'pointer-events-none absolute inset-y-0.5 left-0 shadow-[0_1px_4px_-1px_rgb(0_0_0/20%)] will-change-transform light:bg-white dark:bg-stone-700',
    option:
      'relative flex items-center justify-center text-muted outline-primary transition-colors duration-150 before:absolute before:inset-px before:rounded-[inherit] before:opacity-0 before:transition before:duration-150 has-checked:text-inherit has-focus-visible:text-inherit has-focus-visible:outline-2 light:before:bg-stone-950/6 dark:before:bg-stone-200/8',
    input: 'sr-only',
    content: 'relative flex items-center',
    icon: 'shrink-0',
  },
  variants: {
    size: segmentedControlSizeVariants,
    pill: {
      true: { root: 'rounded-full', thumb: 'rounded-full', option: 'rounded-full' },
    },
    block: {
      true: { root: 'flex w-full overflow-hidden', option: 'flex-1' },
      false: { root: 'inline-flex max-w-full overflow-x-auto align-middle scrollbar-none', option: 'shrink-0' },
    },
    square: {
      true: '',
    },
    disabled: {
      true: { root: 'opacity-50' },
    },
    optionDisabled: {
      true: { option: 'cursor-not-allowed' },
      false: {
        option:
          'cursor-pointer hover:text-inherit not-has-checked:hover:before:opacity-100 active:before:scale-x-(--press-scale-x) active:before:scale-y-97 light:not-has-checked:active:before:bg-stone-950/10 dark:not-has-checked:active:before:bg-stone-200/12',
      },
    },
    isThumbPlaced: {
      true: '',
      false: {
        thumb: 'invisible',
        option:
          'has-checked:before:inset-0 has-checked:before:opacity-100 has-checked:before:shadow-[0_1px_4px_-1px_rgb(0_0_0/20%)] light:has-checked:before:bg-white dark:has-checked:before:bg-stone-700',
      },
    },
    animatesThumb: {
      true: { thumb: 'transition-[width,transform] duration-300 ease-[cubic-bezier(0.19,1,0.22,1)]' },
    },
  },
  compoundVariants: [
    ...segmentedControlSizeNames.flatMap(createShapeCompounds),
    { disabled: false, optionDisabled: true, class: { option: 'opacity-50' } },
  ],
})

export type SegmentedControlThemeVariants = VariantProps<typeof segmentedControlTheme>

export type SegmentedControlSlotName = keyof ReturnType<typeof segmentedControlTheme>
