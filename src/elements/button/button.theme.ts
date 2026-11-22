import { tv, type VariantProps } from '../../shared/utils/tv'

interface ButtonSizeScale {
  height: string
  width: string
  gutter: string
  pillGutter: string
  radius: string
  fontSize: string
  contentGap: string
  iconSize: string
  leadingIconOffset: string
  trailingIconOffset: string
  loadingIndicatorSize: string
}

interface ButtonAppearance {
  surface: string
  selectedSurface: string
  text: string
  selectedText: string
  interaction: string
}

const buttonSizeScales = {
  '3xs': {
    height: 'h-5.5',
    width: 'w-5.5',
    gutter: 'px-1.5',
    pillGutter: 'px-2',
    radius: 'rounded-md',
    fontSize: 'text-xs/none',
    contentGap: 'gap-0.75',
    iconSize: 'size-3.5',
    leadingIconOffset: '-ml-px',
    trailingIconOffset: '-mr-px',
    loadingIndicatorSize: 'text-[11px]',
  },
  '2xs': {
    height: 'h-6',
    width: 'w-6',
    gutter: 'px-2',
    pillGutter: 'px-2.75',
    radius: 'rounded-md',
    fontSize: 'text-xs/none',
    contentGap: 'gap-1',
    iconSize: 'size-4',
    leadingIconOffset: '-ml-px',
    trailingIconOffset: '-mr-px',
    loadingIndicatorSize: 'text-xs',
  },
  'xs': {
    height: 'h-6.5',
    width: 'w-6.5',
    gutter: 'px-2',
    pillGutter: 'px-2.75',
    radius: 'rounded-md',
    fontSize: 'text-sm/none',
    contentGap: 'gap-1',
    iconSize: 'size-4',
    leadingIconOffset: '-ml-px',
    trailingIconOffset: '-mr-px',
    loadingIndicatorSize: 'text-[13px]',
  },
  'sm': {
    height: 'h-7',
    width: 'w-7',
    gutter: 'px-2.5',
    pillGutter: 'px-3.25',
    radius: 'rounded-md',
    fontSize: 'text-sm/none',
    contentGap: 'gap-1',
    iconSize: 'size-4.5',
    leadingIconOffset: '-ml-px',
    trailingIconOffset: '-mr-px',
    loadingIndicatorSize: 'text-[15px]',
  },
  'md': {
    height: 'h-8',
    width: 'w-8',
    gutter: 'px-3',
    pillGutter: 'px-4',
    radius: 'rounded-lg',
    fontSize: 'text-sm/none',
    contentGap: 'gap-1.5',
    iconSize: 'size-4.5',
    leadingIconOffset: '-ml-px',
    trailingIconOffset: '-mr-px',
    loadingIndicatorSize: 'text-base',
  },
  'lg': {
    height: 'h-9',
    width: 'w-9',
    gutter: 'px-3',
    pillGutter: 'px-4',
    radius: 'rounded-lg',
    fontSize: 'text-sm/none',
    contentGap: 'gap-1.5',
    iconSize: 'size-4.5',
    leadingIconOffset: '-ml-px',
    trailingIconOffset: '-mr-px',
    loadingIndicatorSize: 'text-base',
  },
  'xl': {
    height: 'h-10',
    width: 'w-10',
    gutter: 'px-3.5',
    pillGutter: 'px-4.75',
    radius: 'rounded-[10px]',
    fontSize: 'text-sm/none',
    contentGap: 'gap-1.5',
    iconSize: 'size-4.5',
    leadingIconOffset: '-ml-px',
    trailingIconOffset: '-mr-px',
    loadingIndicatorSize: 'text-lg',
  },
  '2xl': {
    height: 'h-11',
    width: 'w-11',
    gutter: 'px-3.5',
    pillGutter: 'px-4.75',
    radius: 'rounded-xl',
    fontSize: 'text-base/none',
    contentGap: 'gap-1.5',
    iconSize: 'size-5',
    leadingIconOffset: '-ml-0.5',
    trailingIconOffset: '-mr-0.5',
    loadingIndicatorSize: 'text-lg',
  },
  '3xl': {
    height: 'h-12',
    width: 'w-12',
    gutter: 'px-4',
    pillGutter: 'px-5.25',
    radius: 'rounded-xl',
    fontSize: 'text-base/none',
    contentGap: 'gap-1.5',
    iconSize: 'size-5',
    leadingIconOffset: '-ml-0.5',
    trailingIconOffset: '-mr-0.5',
    loadingIndicatorSize: 'text-xl',
  },
  '4xl': {
    height: 'h-14',
    width: 'w-14',
    gutter: 'px-4.5',
    pillGutter: 'px-6',
    radius: 'rounded-2xl',
    fontSize: 'text-base/none',
    contentGap: 'gap-3',
    iconSize: 'size-6',
    leadingIconOffset: '-ml-0.5',
    trailingIconOffset: '-mr-0.5',
    loadingIndicatorSize: 'text-2xl',
  },
} satisfies Record<string, ButtonSizeScale>

type ButtonSizeName = keyof typeof buttonSizeScales

const buttonSizeNames = Object.keys(buttonSizeScales) as ButtonSizeName[]

const monochromeSoftAppearance: ButtonAppearance = {
  surface: 'light:before:bg-stone-950/8 dark:before:bg-stone-200/12',
  selectedSurface: 'light:before:bg-stone-950/12 dark:before:bg-stone-200/16',
  text: '',
  selectedText: '',
  interaction:
    'light:hover:before:bg-stone-950/12 dark:hover:before:bg-stone-200/16 light:active:before:bg-stone-950/16 dark:active:before:bg-stone-200/20',
}

const buttonAppearances = {
  solid: {
    primary: {
      surface: 'before:bg-primary',
      selectedSurface: 'before:bg-primary before:brightness-90',
      text: 'light:text-white dark:text-stone-950',
      selectedText: 'light:text-white dark:text-stone-950',
      interaction: 'hover:before:brightness-90',
    },
    secondary: {
      surface: 'before:bg-secondary',
      selectedSurface: 'before:bg-secondary before:brightness-90',
      text: 'light:text-white dark:text-stone-950',
      selectedText: 'light:text-white dark:text-stone-950',
      interaction: 'hover:before:brightness-90',
    },
    neutral: {
      surface: 'light:before:bg-neutral-900 dark:before:bg-stone-200',
      selectedSurface: 'light:before:bg-neutral-800 dark:before:bg-stone-300',
      text: 'light:text-white dark:text-stone-950',
      selectedText: 'light:text-white dark:text-stone-950',
      interaction: 'light:hover:before:bg-neutral-800 dark:hover:before:bg-stone-300 light:active:before:bg-neutral-700',
    },
    gray: {
      surface: 'light:before:bg-stone-600 dark:before:bg-stone-700',
      selectedSurface: 'light:before:bg-stone-700 dark:before:bg-stone-600',
      text: 'light:text-white dark:text-white',
      selectedText: 'light:text-white dark:text-white',
      interaction: 'light:hover:before:bg-stone-700 dark:hover:before:bg-stone-600 light:active:before:bg-stone-800',
    },
    danger: {
      surface: 'light:before:bg-red-600 dark:before:bg-red-600',
      selectedSurface: 'light:before:bg-red-700 dark:before:bg-red-700',
      text: 'light:text-white dark:text-white',
      selectedText: 'light:text-white dark:text-white',
      interaction: 'light:hover:before:bg-red-700 dark:hover:before:bg-red-700',
    },
  },
  soft: {
    primary: {
      surface: 'before:bg-primary/16',
      selectedSurface: 'before:bg-primary/30',
      text: 'text-primary',
      selectedText: 'text-primary',
      interaction: 'hover:before:bg-primary/30',
    },
    secondary: {
      surface: 'before:bg-secondary/16',
      selectedSurface: 'before:bg-secondary/30',
      text: 'text-secondary',
      selectedText: 'text-secondary',
      interaction: 'hover:before:bg-secondary/30',
    },
    neutral: monochromeSoftAppearance,
    gray: monochromeSoftAppearance,
    danger: {
      surface: 'light:before:bg-red-500/16 dark:before:bg-red-400/16',
      selectedSurface: 'light:before:bg-red-500/30 dark:before:bg-red-400/30',
      text: 'light:text-red-600 dark:text-red-400',
      selectedText: 'light:text-red-600 dark:text-red-400',
      interaction: 'light:hover:before:bg-red-500/30 dark:hover:before:bg-red-400/30',
    },
  },
  outline: {
    primary: {
      surface: 'before:border before:border-primary',
      selectedSurface: 'before:border before:border-primary before:bg-primary/8',
      text: 'text-primary',
      selectedText: 'text-primary',
      interaction: 'hover:before:bg-primary/8',
    },
    secondary: {
      surface: 'before:border before:border-secondary',
      selectedSurface: 'before:border before:border-secondary before:bg-secondary/8',
      text: 'text-secondary',
      selectedText: 'text-secondary',
      interaction: 'hover:before:bg-secondary/8',
    },
    neutral: {
      surface: 'before:border light:before:border-stone-950/16 dark:before:border-stone-200/25',
      selectedSurface:
        'before:border light:before:border-stone-950/20 dark:before:border-stone-200/30 light:before:bg-stone-950/2 dark:before:bg-stone-200/4',
      text: '',
      selectedText: '',
      interaction:
        'light:hover:before:border-stone-950/20 dark:hover:before:border-stone-200/30 light:hover:before:bg-stone-950/2 dark:hover:before:bg-stone-200/4 light:active:before:bg-stone-950/4 dark:active:before:bg-stone-200/6',
    },
    gray: {
      surface: 'before:border light:before:border-stone-950/16 dark:before:border-stone-200/25',
      selectedSurface:
        'before:border light:before:border-stone-950/20 dark:before:border-stone-200/30 light:before:bg-stone-950/2 dark:before:bg-stone-200/4',
      text: 'text-muted',
      selectedText: '',
      interaction:
        'hover:text-inherit light:hover:before:border-stone-950/20 dark:hover:before:border-stone-200/30 light:hover:before:bg-stone-950/2 dark:hover:before:bg-stone-200/4 light:active:before:bg-stone-950/4 dark:active:before:bg-stone-200/6',
    },
    danger: {
      surface: 'before:border light:before:border-red-600 dark:before:border-red-400',
      selectedSurface:
        'before:border light:before:border-red-600 dark:before:border-red-400 light:before:bg-red-500/8 dark:before:bg-red-400/8',
      text: 'light:text-red-600 dark:text-red-400',
      selectedText: 'light:text-red-600 dark:text-red-400',
      interaction: 'light:hover:before:bg-red-500/8 dark:hover:before:bg-red-400/8',
    },
  },
  ghost: {
    primary: {
      surface: 'before:scale-96 before:opacity-0 before:bg-primary/16',
      selectedSurface: 'before:bg-primary/16',
      text: 'text-primary',
      selectedText: 'text-primary',
      interaction: 'hover:before:scale-100 hover:before:opacity-100',
    },
    secondary: {
      surface: 'before:scale-96 before:opacity-0 before:bg-secondary/16',
      selectedSurface: 'before:bg-secondary/16',
      text: 'text-secondary',
      selectedText: 'text-secondary',
      interaction: 'hover:before:scale-100 hover:before:opacity-100',
    },
    neutral: {
      surface: 'before:scale-96 before:opacity-0 light:before:bg-stone-950/8 dark:before:bg-stone-200/12',
      selectedSurface: 'light:before:bg-stone-950/8 dark:before:bg-stone-200/12',
      text: '',
      selectedText: '',
      interaction:
        'hover:before:scale-100 hover:before:opacity-100 light:active:before:bg-stone-950/12 dark:active:before:bg-stone-200/16',
    },
    gray: {
      surface: 'before:scale-96 before:opacity-0 light:before:bg-stone-950/8 dark:before:bg-stone-200/12',
      selectedSurface: 'light:before:bg-stone-950/8 dark:before:bg-stone-200/12',
      text: 'text-muted',
      selectedText: '',
      interaction:
        'hover:text-inherit hover:before:scale-100 hover:before:opacity-100 light:active:before:bg-stone-950/12 dark:active:before:bg-stone-200/16',
    },
    danger: {
      surface: 'before:scale-96 before:opacity-0 light:before:bg-red-500/16 dark:before:bg-red-400/16',
      selectedSurface: 'light:before:bg-red-500/16 dark:before:bg-red-400/16',
      text: 'light:text-red-600 dark:text-red-400',
      selectedText: 'light:text-red-600 dark:text-red-400',
      interaction: 'hover:before:scale-100 hover:before:opacity-100',
    },
  },
} satisfies Record<string, Record<string, ButtonAppearance>>

type ButtonVariantName = keyof typeof buttonAppearances
type ButtonColorName = keyof typeof buttonAppearances.solid

const buttonVariantNames = Object.keys(buttonAppearances) as ButtonVariantName[]
const buttonColorNames = Object.keys(buttonAppearances.solid) as ButtonColorName[]

function createSizeVariant(sizeScale: ButtonSizeScale) {
  return {
    base: [sizeScale.height, sizeScale.fontSize],
    content: sizeScale.contentGap,
    leadingIcon: sizeScale.iconSize,
    trailingIcon: sizeScale.iconSize,
    loadingIndicator: sizeScale.loadingIndicatorSize,
  }
}

function createShapeCompounds(sizeName: ButtonSizeName) {
  const sizeScale = buttonSizeScales[sizeName]

  return [
    { size: sizeName, square: false, pill: true, class: { base: ['rounded-full', sizeScale.pillGutter] } },
    { size: sizeName, square: false, pill: false, class: { base: [sizeScale.radius, sizeScale.gutter] } },
    { size: sizeName, square: true, class: { base: sizeScale.width } },
    { size: sizeName, square: true, pill: false, class: { base: sizeScale.radius } },
    {
      size: sizeName,
      square: false,
      class: { leadingIcon: sizeScale.leadingIconOffset, trailingIcon: sizeScale.trailingIconOffset },
    },
  ]
}

function createAppearanceCompounds(variantName: ButtonVariantName, colorName: ButtonColorName) {
  const appearance = buttonAppearances[variantName][colorName]

  return [
    {
      variant: variantName,
      color: colorName,
      disabled: false,
      selected: false,
      class: { base: [appearance.surface, appearance.text] },
    },
    {
      variant: variantName,
      color: colorName,
      disabled: false,
      selected: true,
      class: { base: [appearance.selectedSurface, appearance.selectedText] },
    },
    {
      variant: variantName,
      color: colorName,
      disabled: false,
      loading: false,
      class: { base: appearance.interaction },
    },
  ]
}

const buttonSizeVariants = Object.fromEntries(
  buttonSizeNames.map((sizeName) => [sizeName, createSizeVariant(buttonSizeScales[sizeName])]),
) as Record<ButtonSizeName, ReturnType<typeof createSizeVariant>>

const buttonShapeCompounds = buttonSizeNames.flatMap(createShapeCompounds)

const buttonAppearanceCompounds = buttonVariantNames.flatMap((variantName) =>
  buttonColorNames.flatMap((colorName) => createAppearanceCompounds(variantName, colorName)),
)

export const buttonTheme = tv({
  slots: {
    base: 'relative inline-flex shrink-0 cursor-pointer items-center justify-center font-medium whitespace-nowrap outline-primary transition-colors duration-150 select-none before:absolute before:inset-0 before:rounded-[inherit] before:transition before:duration-150 focus-visible:outline-2',
    loadingOverlay: 'absolute inset-0 flex items-center justify-center',
    loadingIndicator: 'loading-indicator',
    content: 'relative flex size-full items-center justify-center',
    label: '',
    leadingIcon: 'shrink-0',
    trailingIcon: 'shrink-0',
  },
  variants: {
    variant: {
      solid: { base: 'focus-visible:outline-offset-2' },
      soft: { base: 'focus-visible:outline-offset-2' },
      outline: { base: 'focus-visible:-outline-offset-1' },
      ghost: { base: 'focus-visible:-outline-offset-1' },
    },
    color: {
      primary: '',
      secondary: '',
      neutral: '',
      gray: '',
      danger: '',
    },
    size: buttonSizeVariants,
    square: {
      true: '',
    },
    pill: {
      true: '',
    },
    block: {
      true: { base: 'w-full' },
    },
    disabled: {
      true: { base: 'cursor-not-allowed light:text-stone-400 dark:text-stone-500' },
    },
    loading: {
      true: { base: 'pointer-events-none', content: 'opacity-0' },
    },
    selected: {
      true: '',
    },
  },
  compoundVariants: [
    ...buttonShapeCompounds,
    ...buttonAppearanceCompounds,
    { square: true, pill: true, class: { base: 'rounded-full' } },
    {
      disabled: true,
      variant: ['solid', 'soft'],
      class: { base: 'light:before:bg-stone-950/5 dark:before:bg-stone-200/5' },
    },
    {
      disabled: true,
      variant: 'outline',
      class: { base: 'before:border light:before:border-stone-950/6 dark:before:border-stone-200/6' },
    },
    { disabled: false, loading: false, square: true, class: { base: 'active:before:scale-96' } },
    { disabled: false, loading: false, square: false, block: true, class: { base: 'active:before:scale-[0.995]' } },
    { disabled: false, loading: false, square: false, block: false, class: { base: 'active:before:scale-97' } },
  ],
})

export type ButtonThemeVariants = VariantProps<typeof buttonTheme>

export type ButtonSlotName = keyof ReturnType<typeof buttonTheme>
