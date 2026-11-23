import { tv, type VariantProps } from '../../shared/utils/tv'

interface BadgeSizeScale {
  height: string
  fontSize: string
  gutter: string
  pillGutter: string
  radius: string
  iconSize: string
  dotSize: string
}

const badgeSizeScales = {
  sm: {
    height: 'h-5',
    fontSize: 'text-xs/none tracking-wide',
    gutter: 'px-1.25',
    pillGutter: 'px-1.75',
    radius: 'rounded-sm',
    iconSize: 'size-3',
    dotSize: 'size-1.5',
  },
  md: {
    height: 'h-5.5',
    fontSize: 'text-sm/none',
    gutter: 'px-1.5',
    pillGutter: 'px-2',
    radius: 'rounded-sm',
    iconSize: 'size-4',
    dotSize: 'size-1.5',
  },
  lg: {
    height: 'h-6',
    fontSize: 'text-sm/none',
    gutter: 'px-2',
    pillGutter: 'px-2.75',
    radius: 'rounded-md',
    iconSize: 'size-4',
    dotSize: 'size-2',
  },
} satisfies Record<string, BadgeSizeScale>

type BadgeSizeName = keyof typeof badgeSizeScales

const badgeSizeNames = Object.keys(badgeSizeScales) as BadgeSizeName[]

const badgeAppearances = {
  soft: {
    secondary: 'bg-secondary/16 text-secondary',
    gray: 'light:bg-stone-950/8 dark:bg-stone-200/12',
    success: 'light:bg-green-500/16 light:text-green-700 dark:bg-green-400/16 dark:text-green-400',
    warning: 'light:bg-orange-500/16 light:text-orange-700 dark:bg-orange-400/16 dark:text-orange-400',
    danger: 'light:bg-red-500/16 light:text-red-600 dark:bg-red-400/16 dark:text-red-400',
    info: 'light:bg-blue-500/16 light:text-blue-600 dark:bg-blue-400/16 dark:text-blue-300',
    discovery: 'light:bg-purple-500/16 light:text-purple-600 dark:bg-purple-400/16 dark:text-purple-300',
  },
  solid: {
    secondary: 'bg-secondary light:text-white dark:text-stone-950',
    gray: 'light:bg-stone-600 light:text-white dark:bg-stone-600 dark:text-white',
    success: 'light:bg-green-600 light:text-white dark:bg-green-600 dark:text-white',
    warning: 'light:bg-orange-600 light:text-white dark:bg-orange-600 dark:text-white',
    danger: 'light:bg-red-600 light:text-white dark:bg-red-600 dark:text-white',
    info: 'light:bg-blue-600 light:text-white dark:bg-blue-500 dark:text-white',
    discovery: 'light:bg-purple-600 light:text-white dark:bg-purple-500 dark:text-white',
  },
  outline: {
    secondary: 'inset-ring inset-ring-secondary text-secondary',
    gray: 'inset-ring text-muted light:inset-ring-stone-950/16 dark:inset-ring-stone-200/25',
    success: 'inset-ring light:inset-ring-green-600 light:text-green-700 dark:inset-ring-green-500 dark:text-green-400',
    warning:
      'inset-ring light:inset-ring-orange-600 light:text-orange-700 dark:inset-ring-orange-500 dark:text-orange-400',
    danger: 'inset-ring light:inset-ring-red-600 light:text-red-600 dark:inset-ring-red-500 dark:text-red-400',
    info: 'inset-ring light:inset-ring-blue-600 light:text-blue-600 dark:inset-ring-blue-400 dark:text-blue-300',
    discovery:
      'inset-ring light:inset-ring-purple-600 light:text-purple-600 dark:inset-ring-purple-400 dark:text-purple-300',
  },
} satisfies Record<string, Record<string, string>>

type BadgeVariantName = keyof typeof badgeAppearances
type BadgeColorName = keyof typeof badgeAppearances.soft

const badgeVariantNames = Object.keys(badgeAppearances) as BadgeVariantName[]
const badgeColorNames = Object.keys(badgeAppearances.soft) as BadgeColorName[]

function createSizeVariant(sizeScale: BadgeSizeScale) {
  return {
    base: [sizeScale.height, sizeScale.fontSize],
    dot: sizeScale.dotSize,
    leadingIcon: sizeScale.iconSize,
    trailingIcon: sizeScale.iconSize,
  }
}

function createShapeCompounds(sizeName: BadgeSizeName) {
  const sizeScale = badgeSizeScales[sizeName]

  return [
    { size: sizeName, pill: true, class: { base: ['rounded-full', sizeScale.pillGutter] } },
    { size: sizeName, pill: false, class: { base: [sizeScale.radius, sizeScale.gutter] } },
  ]
}

const badgeSizeVariants = Object.fromEntries(
  badgeSizeNames.map((sizeName) => [sizeName, createSizeVariant(badgeSizeScales[sizeName])]),
) as Record<BadgeSizeName, ReturnType<typeof createSizeVariant>>

const badgeShapeCompounds = badgeSizeNames.flatMap(createShapeCompounds)

const badgeAppearanceCompounds = badgeVariantNames.flatMap((variantName) =>
  badgeColorNames.map((colorName) => ({
    variant: variantName,
    color: colorName,
    class: { base: badgeAppearances[variantName][colorName] },
  })),
)

export const badgeTheme = tv({
  slots: {
    base: 'inline-flex shrink-0 items-center gap-1 font-semibold whitespace-nowrap',
    dot: 'shrink-0 rounded-full bg-current',
    leadingIcon: '-ml-px shrink-0',
    trailingIcon: '-mr-px shrink-0',
  },
  variants: {
    variant: {
      soft: '',
      solid: '',
      outline: '',
    },
    color: {
      secondary: '',
      gray: '',
      success: '',
      warning: '',
      danger: '',
      info: '',
      discovery: '',
    },
    size: badgeSizeVariants,
    pill: {
      true: '',
    },
  },
  compoundVariants: [...badgeShapeCompounds, ...badgeAppearanceCompounds],
})

export type BadgeThemeVariants = VariantProps<typeof badgeTheme>

export type BadgeSlotName = keyof ReturnType<typeof badgeTheme>
