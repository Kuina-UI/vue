import type { AvatarProps } from '../../elements/avatar'
import { tv, type VariantProps } from '../../shared/utils/tv'

type AvatarSizeName = NonNullable<AvatarProps['size']>

interface SelectFieldShapeScale {
  corners: string
  gutter: string
  labelOffset: string
  restingLabelOffsetWithLeadingIcon: string
}

interface SelectFieldSizeScale {
  height: string
  fontSize: string
  leadingIconSize: string
  leadingAvatarSize: AvatarSizeName
  trailingIconSize: string
  loadingIndicatorSize: string
  clearButtonSize: string
  clearIconSize: string
  floatingLabelFontSize: string
  restingLabelFontSize: string
  pillShape: SelectFieldShapeScale
  roundedShape: SelectFieldShapeScale
}

const selectFieldSizeScales = {
  md: {
    height: 'h-8',
    fontSize: 'text-sm',
    leadingIconSize: 'size-3',
    leadingAvatarSize: '3xs',
    trailingIconSize: 'size-4',
    loadingIndicatorSize: 'text-base',
    clearButtonSize: 'size-5.5',
    clearIconSize: 'size-3.5',
    floatingLabelFontSize: 'text-[11px]',
    restingLabelFontSize: 'text-sm peer-focus-within:text-[11px]',
    pillShape: { corners: 'rounded-full', gutter: 'px-4', labelOffset: 'left-3', restingLabelOffsetWithLeadingIcon: 'left-8 peer-focus-within:left-3' },
    roundedShape: { corners: 'rounded-lg', gutter: 'px-3', labelOffset: 'left-2', restingLabelOffsetWithLeadingIcon: 'left-7 peer-focus-within:left-2' },
  },
  lg: {
    height: 'h-9',
    fontSize: 'text-sm',
    leadingIconSize: 'size-3',
    leadingAvatarSize: '3xs',
    trailingIconSize: 'size-4',
    loadingIndicatorSize: 'text-base',
    clearButtonSize: 'size-5.5',
    clearIconSize: 'size-3.5',
    floatingLabelFontSize: 'text-[11px]',
    restingLabelFontSize: 'text-sm peer-focus-within:text-[11px]',
    pillShape: { corners: 'rounded-full', gutter: 'px-4', labelOffset: 'left-3', restingLabelOffsetWithLeadingIcon: 'left-8 peer-focus-within:left-3' },
    roundedShape: { corners: 'rounded-lg', gutter: 'px-3', labelOffset: 'left-2', restingLabelOffsetWithLeadingIcon: 'left-7 peer-focus-within:left-2' },
  },
  xl: {
    height: 'h-10',
    fontSize: 'text-base',
    leadingIconSize: 'size-3.5',
    leadingAvatarSize: '2xs',
    trailingIconSize: 'size-4',
    loadingIndicatorSize: 'text-lg',
    clearButtonSize: 'size-6',
    clearIconSize: 'size-4',
    floatingLabelFontSize: 'text-[11px]',
    restingLabelFontSize: 'text-base peer-focus-within:text-[11px]',
    pillShape: {
      corners: 'rounded-full',
      gutter: 'px-4.75',
      labelOffset: 'left-3.75',
      restingLabelOffsetWithLeadingIcon: 'left-9.25 peer-focus-within:left-3.75',
    },
    roundedShape: {
      corners: 'rounded-[10px]',
      gutter: 'px-3.5',
      labelOffset: 'left-2.5',
      restingLabelOffsetWithLeadingIcon: 'left-8 peer-focus-within:left-2.5',
    },
  },
  '2xl': {
    height: 'h-11',
    fontSize: 'text-base',
    leadingIconSize: 'size-4',
    leadingAvatarSize: 'xs',
    trailingIconSize: 'size-4',
    loadingIndicatorSize: 'text-lg',
    clearButtonSize: 'size-6',
    clearIconSize: 'size-4',
    floatingLabelFontSize: 'text-xs',
    restingLabelFontSize: 'text-base peer-focus-within:text-xs',
    pillShape: {
      corners: 'rounded-full',
      gutter: 'px-5.25',
      labelOffset: 'left-4.25',
      restingLabelOffsetWithLeadingIcon: 'left-10.25 peer-focus-within:left-4.25',
    },
    roundedShape: { corners: 'rounded-xl', gutter: 'px-4', labelOffset: 'left-3', restingLabelOffsetWithLeadingIcon: 'left-9 peer-focus-within:left-3' },
  },
  '3xl': {
    height: 'h-12',
    fontSize: 'text-base',
    leadingIconSize: 'size-4',
    leadingAvatarSize: 'sm',
    trailingIconSize: 'size-4.5',
    loadingIndicatorSize: 'text-xl',
    clearButtonSize: 'size-6',
    clearIconSize: 'size-4',
    floatingLabelFontSize: 'text-xs',
    restingLabelFontSize: 'text-base peer-focus-within:text-xs',
    pillShape: {
      corners: 'rounded-full',
      gutter: 'px-5.25',
      labelOffset: 'left-4.25',
      restingLabelOffsetWithLeadingIcon: 'left-10.25 peer-focus-within:left-4.25',
    },
    roundedShape: { corners: 'rounded-xl', gutter: 'px-4', labelOffset: 'left-3', restingLabelOffsetWithLeadingIcon: 'left-9 peer-focus-within:left-3' },
  },
  '4xl': {
    height: 'h-14',
    fontSize: 'text-base',
    leadingIconSize: 'size-4',
    leadingAvatarSize: 'md',
    trailingIconSize: 'size-5',
    loadingIndicatorSize: 'text-2xl',
    clearButtonSize: 'size-7',
    clearIconSize: 'size-4.5',
    floatingLabelFontSize: 'text-xs',
    restingLabelFontSize: 'text-base peer-focus-within:text-xs',
    pillShape: { corners: 'rounded-full', gutter: 'px-6', labelOffset: 'left-5', restingLabelOffsetWithLeadingIcon: 'left-11 peer-focus-within:left-5' },
    roundedShape: {
      corners: 'rounded-2xl',
      gutter: 'px-4.5',
      labelOffset: 'left-3.5',
      restingLabelOffsetWithLeadingIcon: 'left-9.5 peer-focus-within:left-3.5',
    },
  },
} satisfies Record<string, SelectFieldSizeScale>

type SelectFieldSizeName = keyof typeof selectFieldSizeScales

const selectFieldSizeNames = Object.keys(selectFieldSizeScales) as SelectFieldSizeName[]

export function findSelectFieldAvatarSize(selectFieldSize: SelectFieldSizeName) {
  return selectFieldSizeScales[selectFieldSize].leadingAvatarSize
}

function createSizeVariant(sizeScale: SelectFieldSizeScale) {
  return {
    base: [sizeScale.height, sizeScale.fontSize],
    leadingIcon: sizeScale.leadingIconSize,
    trailingIcon: sizeScale.trailingIconSize,
    loadingIndicator: sizeScale.loadingIndicatorSize,
    clearButton: sizeScale.clearButtonSize,
    clearIcon: sizeScale.clearIconSize,
  }
}

function createShapeCompounds(sizeName: SelectFieldSizeName) {
  const sizeScale: SelectFieldSizeScale = selectFieldSizeScales[sizeName]

  return [true, false].flatMap((pill) => {
    const shape = pill ? sizeScale.pillShape : sizeScale.roundedShape

    return [
      { size: sizeName, pill, class: { base: [shape.corners, shape.gutter] } },
      {
        size: sizeName,
        pill,
        labelFloating: true,
        class: { label: [shape.labelOffset, sizeScale.floatingLabelFontSize] },
      },
      {
        size: sizeName,
        pill,
        labelFloating: false,
        hasLeadingIcon: false,
        class: { label: [shape.labelOffset, sizeScale.restingLabelFontSize] },
      },
      {
        size: sizeName,
        pill,
        labelFloating: false,
        hasLeadingIcon: true,
        class: { label: [shape.restingLabelOffsetWithLeadingIcon, sizeScale.restingLabelFontSize] },
      },
    ] as const
  })
}

const selectFieldSizeVariants = Object.fromEntries(
  selectFieldSizeNames.map((sizeName) => [sizeName, createSizeVariant(selectFieldSizeScales[sizeName])]),
) as Record<SelectFieldSizeName, ReturnType<typeof createSizeVariant>>

export const selectFieldTheme = tv({
  slots: {
    root: '',
    container: 'relative',
    base: 'peer group flex w-full items-center gap-2 border bg-field whitespace-nowrap outline-hidden transition-colors select-none',
    leadingIcon: 'shrink-0 text-muted',
    leadingAvatar: 'flex shrink-0',
    value: 'min-w-0 flex-1 truncate',
    input:
      'min-w-0 flex-1 truncate bg-transparent outline-hidden placeholder:text-muted placeholder:opacity-0 placeholder:transition-opacity focus:placeholder:opacity-100',
    placeholder: 'text-muted opacity-0 transition-opacity group-focus-within:opacity-100',
    selectionForScreenReaders: 'sr-only',
    trailing: 'flex shrink-0 items-center gap-1',
    clearButton:
      'flex cursor-pointer items-center justify-center rounded-full outline-primary transition focus-visible:outline-2',
    clearIcon: '',
    loadingIndicator: '',
    trailingIcon: 'shrink-0 text-muted transition-opacity group-hover:opacity-100',
    label:
      'pointer-events-none absolute -translate-y-1/2 from-canvas from-50% to-field to-50% px-1 whitespace-nowrap transition-all',
    hint: 'mt-2 text-xs text-muted',
    errorMessage: 'mt-2 flex items-start gap-x-1.5 text-xs light:text-red-600 dark:text-red-400',
    errorIcon: 'mt-px size-3.5 shrink-0',
  },
  variants: {
    size: selectFieldSizeVariants,
    variant: {
      outline: '',
      soft: '',
    },
    pill: {
      true: '',
      false: '',
    },
    fieldState: {
      invalid: { base: 'light:border-red-600 dark:border-red-500', label: 'light:text-red-600 dark:text-red-400' },
      disabled: { label: 'text-muted' },
      open: { base: 'border-primary', label: 'text-primary' },
      idle: { label: 'text-muted peer-focus-within:text-primary' },
    },
    labelFloating: {
      true: { label: 'top-0 bg-linear-to-b' },
      false: { label: 'top-1/2 peer-focus-within:top-0 peer-focus-within:bg-linear-to-b' },
    },
    hasLeadingIcon: {
      true: '',
      false: '',
    },
    disabled: {
      true: { container: 'opacity-50', base: 'cursor-not-allowed' },
      false: { base: 'cursor-pointer' },
    },
    open: {
      true: { trailingIcon: 'opacity-100', placeholder: 'opacity-100' },
      false: { trailingIcon: 'opacity-75' },
    },
    hasTrailingIcon: {
      true: {
        clearButton: 'text-muted opacity-75 hover:opacity-100 light:hover:bg-stone-950/8 dark:hover:bg-stone-200/12',
      },
      false: { clearButton: 'light:bg-stone-600 light:text-white dark:bg-stone-600 dark:text-white' },
    },
  },
  compoundVariants: [
    ...selectFieldSizeNames.flatMap(createShapeCompounds),
    { fieldState: 'disabled', variant: 'outline', class: { base: 'border-line' } },
    { fieldState: 'disabled', variant: 'soft', class: { base: 'border-transparent' } },
    {
      fieldState: 'idle',
      variant: 'outline',
      class: {
        base: 'border-line light:not-focus-within:hover:border-stone-950/20 dark:not-focus-within:hover:border-white/20 focus-within:border-primary',
      },
    },
    { fieldState: 'idle', variant: 'soft', class: { base: 'border-transparent focus-within:border-primary' } },
  ],
  defaultVariants: {
    size: '4xl',
    variant: 'outline',
    pill: true,
    fieldState: 'idle',
    labelFloating: false,
    hasLeadingIcon: false,
    disabled: false,
    open: false,
    hasTrailingIcon: true,
  },
})

export type SelectFieldThemeVariants = VariantProps<typeof selectFieldTheme>

export type SelectFieldSlotName = keyof ReturnType<typeof selectFieldTheme>
