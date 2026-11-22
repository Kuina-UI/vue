import { tv, type VariantProps } from '../../shared/utils/tv'

interface TextareaShapeScale {
  corners: string
  horizontalPadding: string
  labelOffset: string
}

interface TextareaSizeScale {
  fontSize: string
  verticalPadding: string
  labelFontSize: string
  labelRestingTop: string
  autoResizeHeights: string
  pillShape: TextareaShapeScale
  roundedShape: TextareaShapeScale
}

const textareaSizeScales = {
  md: {
    fontSize: 'text-sm',
    verticalPadding: 'py-1.25',
    labelFontSize: 'text-[11px] peer-placeholder-shown:text-sm peer-focus:text-[11px]',
    labelRestingTop: 'peer-placeholder-shown:top-4',
    autoResizeHeights:
      'min-h-[calc(var(--textarea-min-rows)*1lh+12px)] max-h-[calc(var(--textarea-max-rows)*1lh+12px)]',
    pillShape: { corners: 'rounded-2xl', horizontalPadding: 'px-4', labelOffset: 'left-3' },
    roundedShape: { corners: 'rounded-lg', horizontalPadding: 'px-3', labelOffset: 'left-2' },
  },
  lg: {
    fontSize: 'text-sm',
    verticalPadding: 'py-1.75',
    labelFontSize: 'text-[11px] peer-placeholder-shown:text-sm peer-focus:text-[11px]',
    labelRestingTop: 'peer-placeholder-shown:top-4.5',
    autoResizeHeights:
      'min-h-[calc(var(--textarea-min-rows)*1lh+16px)] max-h-[calc(var(--textarea-max-rows)*1lh+16px)]',
    pillShape: { corners: 'rounded-[18px]', horizontalPadding: 'px-4', labelOffset: 'left-3' },
    roundedShape: { corners: 'rounded-lg', horizontalPadding: 'px-3', labelOffset: 'left-2' },
  },
  xl: {
    fontSize: 'text-base',
    verticalPadding: 'py-1.75',
    labelFontSize: 'text-[11px] peer-placeholder-shown:text-base peer-focus:text-[11px]',
    labelRestingTop: 'peer-placeholder-shown:top-5',
    autoResizeHeights:
      'min-h-[calc(var(--textarea-min-rows)*1lh+16px)] max-h-[calc(var(--textarea-max-rows)*1lh+16px)]',
    pillShape: { corners: 'rounded-[20px]', horizontalPadding: 'px-4.75', labelOffset: 'left-3.75' },
    roundedShape: { corners: 'rounded-[10px]', horizontalPadding: 'px-3.5', labelOffset: 'left-2.5' },
  },
  '2xl': {
    fontSize: 'text-base',
    verticalPadding: 'py-2.25',
    labelFontSize: 'text-xs peer-placeholder-shown:text-base peer-focus:text-xs',
    labelRestingTop: 'peer-placeholder-shown:top-5.5',
    autoResizeHeights:
      'min-h-[calc(var(--textarea-min-rows)*1lh+20px)] max-h-[calc(var(--textarea-max-rows)*1lh+20px)]',
    pillShape: { corners: 'rounded-[22px]', horizontalPadding: 'px-5.25', labelOffset: 'left-4.25' },
    roundedShape: { corners: 'rounded-xl', horizontalPadding: 'px-4', labelOffset: 'left-3' },
  },
  '3xl': {
    fontSize: 'text-base',
    verticalPadding: 'py-2.75',
    labelFontSize: 'text-xs peer-placeholder-shown:text-base peer-focus:text-xs',
    labelRestingTop: 'peer-placeholder-shown:top-6',
    autoResizeHeights:
      'min-h-[calc(var(--textarea-min-rows)*1lh+24px)] max-h-[calc(var(--textarea-max-rows)*1lh+24px)]',
    pillShape: { corners: 'rounded-3xl', horizontalPadding: 'px-5.25', labelOffset: 'left-4.25' },
    roundedShape: { corners: 'rounded-xl', horizontalPadding: 'px-4', labelOffset: 'left-3' },
  },
  '4xl': {
    fontSize: 'text-base',
    verticalPadding: 'py-3.75',
    labelFontSize: 'text-xs peer-placeholder-shown:text-base peer-focus:text-xs',
    labelRestingTop: 'peer-placeholder-shown:top-7',
    autoResizeHeights:
      'min-h-[calc(var(--textarea-min-rows)*1lh+32px)] max-h-[calc(var(--textarea-max-rows)*1lh+32px)]',
    pillShape: { corners: 'rounded-[28px]', horizontalPadding: 'px-6', labelOffset: 'left-5' },
    roundedShape: { corners: 'rounded-2xl', horizontalPadding: 'px-4.5', labelOffset: 'left-3.5' },
  },
} satisfies Record<string, TextareaSizeScale>

type TextareaSizeName = keyof typeof textareaSizeScales

const textareaSizeNames = Object.keys(textareaSizeScales) as TextareaSizeName[]

function createSizeVariant(sizeScale: TextareaSizeScale) {
  return {
    base: [sizeScale.fontSize, sizeScale.verticalPadding],
    label: [sizeScale.labelFontSize, sizeScale.labelRestingTop],
  }
}

function createSizeCompounds(sizeName: TextareaSizeName) {
  const sizeScale = textareaSizeScales[sizeName]

  return [
    {
      size: sizeName,
      pill: true,
      class: {
        base: [sizeScale.pillShape.corners, sizeScale.pillShape.horizontalPadding],
        label: sizeScale.pillShape.labelOffset,
      },
    },
    {
      size: sizeName,
      pill: false,
      class: {
        base: [sizeScale.roundedShape.corners, sizeScale.roundedShape.horizontalPadding],
        label: sizeScale.roundedShape.labelOffset,
      },
    },
    { size: sizeName, autoResize: true, class: { base: sizeScale.autoResizeHeights } },
  ]
}

const textareaSizeVariants = Object.fromEntries(
  textareaSizeNames.map((sizeName) => [sizeName, createSizeVariant(textareaSizeScales[sizeName])]),
) as Record<TextareaSizeName, ReturnType<typeof createSizeVariant>>

const textareaSizeCompounds = textareaSizeNames.flatMap(createSizeCompounds)

export const textareaTheme = tv({
  slots: {
    root: '',
    container: 'relative',
    base: 'peer block w-full resize-none border bg-field outline-hidden transition-colors',
    label:
      'pointer-events-none absolute top-0 -translate-y-1/2 bg-linear-to-b from-canvas from-50% to-field to-50% px-1 transition-colors peer-placeholder-shown:bg-none peer-placeholder-shown:transition-all peer-focus:top-0 peer-focus:bg-linear-to-b peer-focus:transition-all',
    footer: 'mt-2 flex items-start gap-x-4 text-xs',
    hint: 'text-muted',
    errorMessage: 'flex items-start gap-x-1.5 light:text-red-600 dark:text-red-400',
    errorIcon: 'mt-px size-3.5 shrink-0',
    characterCount: 'ml-auto shrink-0 text-muted tabular-nums',
  },
  variants: {
    variant: {
      outline: '',
      soft: '',
    },
    size: textareaSizeVariants,
    pill: {
      true: '',
    },
    autoResize: {
      true: { base: 'field-sizing-content' },
    },
    invalid: {
      true: {
        base: 'light:border-red-600 dark:border-red-500 light:selection:bg-red-500/16 dark:selection:bg-red-400/16',
        label: 'light:text-red-600 dark:text-red-400',
      },
    },
    disabled: {
      true: { container: 'opacity-50' },
    },
  },
  compoundVariants: [
    ...textareaSizeCompounds,
    {
      invalid: false,
      disabled: false,
      variant: 'outline',
      class: {
        base: 'border-line light:not-focus:hover:border-stone-950/20 dark:not-focus:hover:border-white/20 focus:border-primary',
        label: 'text-muted peer-focus:text-primary',
      },
    },
    {
      invalid: false,
      disabled: false,
      variant: 'soft',
      class: { base: 'border-transparent focus:border-primary', label: 'text-muted peer-focus:text-primary' },
    },
    {
      invalid: false,
      disabled: true,
      variant: 'outline',
      class: { base: 'cursor-not-allowed border-line', label: 'text-muted' },
    },
    {
      invalid: false,
      disabled: true,
      variant: 'soft',
      class: { base: 'cursor-not-allowed border-transparent', label: 'text-muted' },
    },
  ],
})

export type TextareaThemeVariants = VariantProps<typeof textareaTheme>

export type TextareaSlotName = keyof ReturnType<typeof textareaTheme>
