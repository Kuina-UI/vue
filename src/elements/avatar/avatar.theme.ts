import { tv, type VariantProps } from '../../shared/utils/tv'

interface AvatarSizeScale {
  sizeVariable: string
  radius: string
}

const avatarSizeScales = {
  '3xs': { sizeVariable: '[--avatar-size:22px]', radius: 'rounded-md' },
  '2xs': { sizeVariable: '[--avatar-size:24px]', radius: 'rounded-md' },
  'xs': { sizeVariable: '[--avatar-size:26px]', radius: 'rounded-md' },
  'sm': { sizeVariable: '[--avatar-size:28px]', radius: 'rounded-md' },
  'md': { sizeVariable: '[--avatar-size:32px]', radius: 'rounded-lg' },
  'lg': { sizeVariable: '[--avatar-size:36px]', radius: 'rounded-lg' },
  'xl': { sizeVariable: '[--avatar-size:40px]', radius: 'rounded-[10px]' },
  '2xl': { sizeVariable: '[--avatar-size:44px]', radius: 'rounded-xl' },
  '3xl': { sizeVariable: '[--avatar-size:48px]', radius: 'rounded-xl' },
  '4xl': { sizeVariable: '[--avatar-size:56px]', radius: 'rounded-2xl' },
  '5xl': { sizeVariable: '[--avatar-size:64px]', radius: 'rounded-2xl' },
  '6xl': { sizeVariable: '[--avatar-size:80px]', radius: 'rounded-3xl' },
} satisfies Record<string, AvatarSizeScale>

type AvatarSizeName = keyof typeof avatarSizeScales

const avatarSizeNames = Object.keys(avatarSizeScales) as AvatarSizeName[]

const avatarAppearances = {
  soft: {
    primary: 'light:bg-stone-200 dark:bg-stone-700',
    secondary: 'bg-secondary/16 text-secondary',
    gray: 'light:bg-stone-200 dark:bg-stone-700',
    success: 'light:bg-green-100 light:text-green-700 dark:bg-green-950 dark:text-green-400',
    info: 'light:bg-blue-100 light:text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    discovery: 'light:bg-purple-100 light:text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    danger: 'light:bg-red-100 light:text-red-700 dark:bg-red-950 dark:text-red-400',
  },
  solid: {
    primary: 'light:bg-neutral-900 light:text-white dark:bg-stone-200 dark:text-stone-950',
    secondary: 'bg-secondary light:text-white dark:text-stone-950',
    gray: 'light:bg-stone-600 light:text-white dark:bg-stone-600 dark:text-white',
    success: 'light:bg-green-600 light:text-white dark:bg-green-600 dark:text-white',
    info: 'light:bg-blue-600 light:text-white dark:bg-blue-500 dark:text-white',
    discovery: 'light:bg-purple-600 light:text-white dark:bg-purple-500 dark:text-white',
    danger: 'light:bg-red-600 light:text-white dark:bg-red-600 dark:text-white',
  },
} satisfies Record<string, Record<string, string>>

type AvatarVariantName = keyof typeof avatarAppearances
type AvatarColorName = keyof typeof avatarAppearances.soft

const avatarVariantNames = Object.keys(avatarAppearances) as AvatarVariantName[]
const avatarColorNames = Object.keys(avatarAppearances.soft) as AvatarColorName[]

const avatarSizeVariants = Object.fromEntries(
  avatarSizeNames.map((sizeName) => [sizeName, { base: avatarSizeScales[sizeName].sizeVariable }]),
) as Record<AvatarSizeName, { base: string }>

const avatarShapeCompounds = avatarSizeNames.flatMap((sizeName) => [
  { size: sizeName, pill: true, class: { base: 'rounded-full' } },
  { size: sizeName, pill: false, class: { base: avatarSizeScales[sizeName].radius } },
])

const avatarAppearanceCompounds = avatarVariantNames.flatMap((variantName) =>
  avatarColorNames.map((colorName) => ({
    variant: variantName,
    color: colorName,
    class: { base: avatarAppearances[variantName][colorName] },
  })),
)

export const avatarTheme = tv({
  slots: {
    base: 'relative inline-flex size-(--avatar-size) shrink-0 items-center justify-center overflow-hidden select-none',
    image: 'absolute inset-0 size-full rounded-[inherit] object-cover',
    icon: 'size-[calc(var(--avatar-size)*0.55)] shrink-0',
    label: 'font-semibold',
    overflowSign: 'relative -top-[calc(var(--avatar-size)/24)] -ml-px',
  },
  variants: {
    variant: {
      soft: '',
      solid: '',
    },
    color: {
      primary: '',
      secondary: '',
      gray: '',
      success: '',
      info: '',
      discovery: '',
      danger: '',
    },
    size: avatarSizeVariants,
    pill: {
      true: '',
    },
    hasImage: {
      true: {
        base: 'after:absolute after:inset-0 after:rounded-[inherit] after:border light:after:border-black/4 dark:after:border-white/15',
      },
    },
    isLink: {
      true: { base: 'outline-primary focus-visible:outline-2 focus-visible:outline-offset-2' },
    },
    isOverflow: {
      true: { label: 'flex' },
    },
    labelCharacterCount: {
      one: '',
      two: '',
      many: { label: 'text-[length:calc(var(--avatar-size)*0.3)]/none' },
    },
  },
  compoundVariants: [
    ...avatarShapeCompounds,
    ...avatarAppearanceCompounds,
    {
      isOverflow: false,
      labelCharacterCount: 'one',
      class: { label: 'text-[length:calc(var(--avatar-size)*0.5)]/none' },
    },
    {
      isOverflow: false,
      labelCharacterCount: 'two',
      class: { label: 'text-[length:calc(var(--avatar-size)*0.4)]/none' },
    },
    {
      isOverflow: true,
      labelCharacterCount: 'one',
      class: { label: 'text-[length:calc(var(--avatar-size)*0.45)]/none' },
    },
    {
      isOverflow: true,
      labelCharacterCount: 'two',
      class: { label: 'text-[length:calc(var(--avatar-size)*0.37)]/none' },
    },
  ],
})

export type AvatarThemeVariants = VariantProps<typeof avatarTheme>

export type AvatarSlotName = keyof ReturnType<typeof avatarTheme>
