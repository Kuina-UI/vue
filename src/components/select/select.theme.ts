import type { AvatarProps } from '../../elements/avatar'
import { tv, type VariantProps } from '../../shared/utils/tv'

type AvatarSizeName = NonNullable<AvatarProps['size']>

interface SelectSizeScale {
  height: string
  gutter: string
  pillGutter: string
  corners: string
  fontSize: string
  contentGap: string
  leadingIconSize: string
  leadingIconPillOffset: string
  leadingAvatarSize?: AvatarSizeName
  leadingAvatarPillOffset: string
  leadingAvatarRoundedOffset: string
  trailingIconSize: string
  trailingIconPillOffset: string
  loadingIndicatorSize: string
  clearButtonSize: string
  clearIconSize: string
}

interface SelectAppearance {
  surface: string
  interaction: string
  openSurface: string
  invalidSurface: string
  focusOffset: string
  searchFocusOffset: string
}

const selectSizeScales = {
  '3xs': {
    height: 'h-5.5',
    gutter: 'px-1.5',
    pillGutter: 'px-2',
    corners: 'rounded-md',
    fontSize: 'text-xs',
    contentGap: 'gap-1',
    leadingIconSize: 'size-3.5',
    leadingIconPillOffset: '',
    leadingAvatarPillOffset: '',
    leadingAvatarRoundedOffset: '',
    trailingIconSize: 'size-3',
    trailingIconPillOffset: '',
    loadingIndicatorSize: 'text-[11px]',
    clearButtonSize: 'size-3.5',
    clearIconSize: 'size-3',
  },
  '2xs': {
    height: 'h-6',
    gutter: 'px-2',
    pillGutter: 'px-2.75',
    corners: 'rounded-md',
    fontSize: 'text-xs',
    contentGap: 'gap-1.5',
    leadingIconSize: 'size-4',
    leadingIconPillOffset: '-ml-px',
    leadingAvatarPillOffset: '',
    leadingAvatarRoundedOffset: '',
    trailingIconSize: 'size-3',
    trailingIconPillOffset: '',
    loadingIndicatorSize: 'text-xs',
    clearButtonSize: 'size-4',
    clearIconSize: 'size-3',
  },
  'xs': {
    height: 'h-6.5',
    gutter: 'px-2',
    pillGutter: 'px-2.75',
    corners: 'rounded-md',
    fontSize: 'text-sm',
    contentGap: 'gap-1.5',
    leadingIconSize: 'size-4',
    leadingIconPillOffset: '-ml-px',
    leadingAvatarPillOffset: '',
    leadingAvatarRoundedOffset: '',
    trailingIconSize: 'size-3.5',
    trailingIconPillOffset: '',
    loadingIndicatorSize: 'text-[13px]',
    clearButtonSize: 'size-4.5',
    clearIconSize: 'size-3.5',
  },
  'sm': {
    height: 'h-7',
    gutter: 'px-2.5',
    pillGutter: 'px-3.25',
    corners: 'rounded-md',
    fontSize: 'text-sm',
    contentGap: 'gap-2',
    leadingIconSize: 'size-4',
    leadingIconPillOffset: '-ml-0.5',
    leadingAvatarPillOffset: '',
    leadingAvatarRoundedOffset: '',
    trailingIconSize: 'size-3.5',
    trailingIconPillOffset: '-mr-0.5',
    loadingIndicatorSize: 'text-[15px]',
    clearButtonSize: 'size-4.5',
    clearIconSize: 'size-3.5',
  },
  'md': {
    height: 'h-8',
    gutter: 'px-3',
    pillGutter: 'px-4',
    corners: 'rounded-lg',
    fontSize: 'text-sm',
    contentGap: 'gap-2',
    leadingIconSize: 'size-4.5',
    leadingIconPillOffset: '-ml-1',
    leadingAvatarSize: '3xs',
    leadingAvatarPillOffset: '-ml-2.75',
    leadingAvatarRoundedOffset: '-ml-1.75',
    trailingIconSize: 'size-4',
    trailingIconPillOffset: '-mr-0.5',
    loadingIndicatorSize: 'text-base',
    clearButtonSize: 'size-5.5',
    clearIconSize: 'size-3.5',
  },
  'lg': {
    height: 'h-9',
    gutter: 'px-3',
    pillGutter: 'px-4',
    corners: 'rounded-lg',
    fontSize: 'text-sm',
    contentGap: 'gap-2',
    leadingIconSize: 'size-4.5',
    leadingIconPillOffset: '-ml-1',
    leadingAvatarSize: '2xs',
    leadingAvatarPillOffset: '-ml-2.5',
    leadingAvatarRoundedOffset: '-ml-1.5',
    trailingIconSize: 'size-4',
    trailingIconPillOffset: '-mr-0.5',
    loadingIndicatorSize: 'text-base',
    clearButtonSize: 'size-5.5',
    clearIconSize: 'size-3.5',
  },
  'xl': {
    height: 'h-10',
    gutter: 'px-3.5',
    pillGutter: 'px-4.75',
    corners: 'rounded-[10px]',
    fontSize: 'text-sm',
    contentGap: 'gap-2',
    leadingIconSize: 'size-4.5',
    leadingIconPillOffset: '-ml-1',
    leadingAvatarSize: 'xs',
    leadingAvatarPillOffset: '-ml-3',
    leadingAvatarRoundedOffset: '-ml-1.75',
    trailingIconSize: 'size-4',
    trailingIconPillOffset: '-mr-0.5',
    loadingIndicatorSize: 'text-lg',
    clearButtonSize: 'size-6',
    clearIconSize: 'size-4',
  },
  '2xl': {
    height: 'h-11',
    gutter: 'px-3.5',
    pillGutter: 'px-4.75',
    corners: 'rounded-xl',
    fontSize: 'text-base',
    contentGap: 'gap-2.5',
    leadingIconSize: 'size-5',
    leadingIconPillOffset: '-ml-1',
    leadingAvatarSize: 'sm',
    leadingAvatarPillOffset: '-ml-2.75',
    leadingAvatarRoundedOffset: '-ml-1.5',
    trailingIconSize: 'size-4',
    trailingIconPillOffset: '-mr-0.5',
    loadingIndicatorSize: 'text-lg',
    clearButtonSize: 'size-6',
    clearIconSize: 'size-4',
  },
  '3xl': {
    height: 'h-12',
    gutter: 'px-4',
    pillGutter: 'px-5.25',
    corners: 'rounded-xl',
    fontSize: 'text-base',
    contentGap: 'gap-2.5',
    leadingIconSize: 'size-5',
    leadingIconPillOffset: '-ml-1',
    leadingAvatarSize: 'md',
    leadingAvatarPillOffset: '-ml-3.25',
    leadingAvatarRoundedOffset: '-ml-2',
    trailingIconSize: 'size-4.5',
    trailingIconPillOffset: '-mr-0.75',
    loadingIndicatorSize: 'text-xl',
    clearButtonSize: 'size-6',
    clearIconSize: 'size-4',
  },
  '4xl': {
    height: 'h-14',
    gutter: 'px-4.5',
    pillGutter: 'px-6',
    corners: 'rounded-2xl',
    fontSize: 'text-base',
    contentGap: 'gap-3',
    leadingIconSize: 'size-5',
    leadingIconPillOffset: '-ml-1',
    leadingAvatarSize: 'lg',
    leadingAvatarPillOffset: '-ml-3.5',
    leadingAvatarRoundedOffset: '-ml-2',
    trailingIconSize: 'size-5',
    trailingIconPillOffset: '-mr-1',
    loadingIndicatorSize: 'text-2xl',
    clearButtonSize: 'size-7',
    clearIconSize: 'size-4.5',
  },
} satisfies Record<string, SelectSizeScale>

const selectAppearances = {
  outline: {
    surface: 'border border-line',
    interaction: 'light:hover:border-stone-950/20 dark:hover:border-white/20',
    openSurface: 'light:border-stone-950/20 dark:border-white/20',
    invalidSurface: 'border light:border-red-600 dark:border-red-500',
    focusOffset: 'focus-visible:-outline-offset-1',
    searchFocusOffset: 'has-[input:focus-visible]:-outline-offset-1',
  },
  soft: {
    surface: 'light:bg-stone-950/8 dark:bg-stone-200/12',
    interaction: 'light:hover:bg-stone-950/12 dark:hover:bg-stone-200/16',
    openSurface: 'light:bg-stone-950/12 dark:bg-stone-200/16',
    invalidSurface: 'inset-ring light:bg-stone-950/8 light:inset-ring-red-600 dark:bg-stone-200/12 dark:inset-ring-red-500',
    focusOffset: 'focus-visible:outline-offset-2',
    searchFocusOffset: 'has-[input:focus-visible]:outline-offset-2',
  },
  ghost: {
    surface: '',
    interaction: 'light:hover:bg-stone-950/8 dark:hover:bg-stone-200/12',
    openSurface: 'light:bg-stone-950/5 dark:bg-stone-200/7',
    invalidSurface: 'inset-ring light:inset-ring-red-600 dark:inset-ring-red-500',
    focusOffset: 'focus-visible:-outline-offset-1',
    searchFocusOffset: 'has-[input:focus-visible]:-outline-offset-1',
  },
} satisfies Record<string, SelectAppearance>

type SelectSizeName = keyof typeof selectSizeScales
type SelectAppearanceName = keyof typeof selectAppearances

const selectSizeNames = Object.keys(selectSizeScales) as SelectSizeName[]
const selectAppearanceNames = Object.keys(selectAppearances) as SelectAppearanceName[]

/** Find the avatar size that fits the trigger of a select, or nothing when the trigger is too small for one. */
export function findSelectTriggerAvatarSize(selectSize: SelectSizeName): AvatarSizeName | undefined {
  const sizeScale: SelectSizeScale = selectSizeScales[selectSize]
  return sizeScale.leadingAvatarSize
}

function createSizeVariant(sizeScale: SelectSizeScale) {
  return {
    base: [sizeScale.height, sizeScale.fontSize, sizeScale.contentGap],
    leadingIcon: sizeScale.leadingIconSize,
    trailingIcon: sizeScale.trailingIconSize,
    loadingIndicator: sizeScale.loadingIndicatorSize,
    clearButton: sizeScale.clearButtonSize,
    clearIcon: sizeScale.clearIconSize,
  }
}

function createShapeCompounds(sizeName: SelectSizeName) {
  const sizeScale: SelectSizeScale = selectSizeScales[sizeName]

  return [
    {
      size: sizeName,
      pill: true,
      class: {
        base: [sizeScale.pillGutter, 'rounded-full'],
        leadingIcon: sizeScale.leadingIconPillOffset,
        leadingAvatar: sizeScale.leadingAvatarPillOffset,
        trailingIcon: sizeScale.trailingIconPillOffset,
      },
    },
    {
      size: sizeName,
      pill: false,
      class: {
        base: [sizeScale.gutter, sizeScale.corners],
        leadingIcon: '-ml-px',
        leadingAvatar: sizeScale.leadingAvatarRoundedOffset,
      },
    },
  ] as const
}

function createAppearanceCompounds(appearanceName: SelectAppearanceName) {
  const appearance: SelectAppearance = selectAppearances[appearanceName]

  return [
    { variant: appearanceName, searchesInTrigger: false, class: { base: appearance.focusOffset } },
    { variant: appearanceName, searchesInTrigger: true, class: { base: appearance.searchFocusOffset } },
    {
      variant: appearanceName,
      invalid: true,
      class: { base: [appearance.invalidSurface, 'light:outline-red-600 dark:outline-red-500'] },
    },
    {
      variant: appearanceName,
      invalid: false,
      open: true,
      class: { base: [appearance.surface, appearance.openSurface, 'outline-primary'] },
    },
    {
      variant: appearanceName,
      invalid: false,
      open: false,
      class: { base: [appearance.surface, 'outline-primary'] },
    },
    { variant: appearanceName, invalid: false, open: false, interactive: true, class: { base: appearance.interaction } },
  ] as const
}

const selectSizeVariants = Object.fromEntries(
  selectSizeNames.map((sizeName) => [sizeName, createSizeVariant(selectSizeScales[sizeName])]),
) as Record<SelectSizeName, ReturnType<typeof createSizeVariant>>

export const selectTheme = tv({
  slots: {
    root: 'relative',
    base: 'group flex w-full items-center justify-between leading-6 font-medium whitespace-nowrap transition-colors select-none',
    leadingIcon: 'shrink-0',
    leadingAvatar: 'flex shrink-0',
    value: 'min-w-0 flex-1 truncate text-left',
    input: 'min-w-0 flex-1 truncate bg-transparent text-left outline-hidden select-text placeholder:text-muted',
    selectionForScreenReaders: 'sr-only',
    trailing: 'flex shrink-0 items-center gap-1',
    clearButton:
      'flex cursor-pointer items-center justify-center rounded-full outline-primary transition focus-visible:outline-2',
    clearIcon: '',
    loadingIndicator: '',
    trailingIcon: 'shrink-0 text-muted transition-opacity group-hover:opacity-100',
  },
  variants: {
    size: selectSizeVariants,
    variant: {
      outline: '',
      soft: '',
      ghost: '',
    },
    pill: {
      true: '',
      false: '',
    },
    block: {
      true: { root: 'w-full' },
      false: { root: 'inline-block max-w-full' },
    },
    open: {
      true: { trailingIcon: 'opacity-100' },
      false: { trailingIcon: 'opacity-75' },
    },
    invalid: {
      true: '',
      false: '',
    },
    interactive: {
      true: '',
      false: '',
    },
    disabled: {
      true: { base: 'cursor-not-allowed opacity-50' },
      false: { base: 'cursor-pointer' },
    },
    hasSelection: {
      true: '',
      false: '',
    },
    searchesInTrigger: {
      true: { base: 'has-[input:focus-visible]:outline-2' },
      false: { base: 'focus-visible:outline-2' },
    },
    hasTrailingIcon: {
      true: {
        clearButton: 'text-muted opacity-75 hover:opacity-100 light:hover:bg-stone-950/8 dark:hover:bg-stone-200/12',
      },
      false: { clearButton: 'light:bg-stone-600 light:text-white dark:bg-stone-600 dark:text-white' },
    },
  },
  compoundVariants: [
    ...selectSizeNames.flatMap(createShapeCompounds),
    ...selectAppearanceNames.flatMap(createAppearanceCompounds),
    { hasSelection: false, searchesInTrigger: false, class: { base: 'text-muted' } },
  ],
  defaultVariants: {
    size: 'md',
    variant: 'outline',
    pill: true,
    block: true,
    open: false,
    invalid: false,
    interactive: true,
    disabled: false,
    hasSelection: false,
    searchesInTrigger: false,
    hasTrailingIcon: true,
  },
})

export type SelectThemeVariants = VariantProps<typeof selectTheme>

export type SelectSlotName = keyof ReturnType<typeof selectTheme>
