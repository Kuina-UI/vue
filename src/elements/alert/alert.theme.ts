import { tv, type VariantProps } from '../../shared/utils/tv'

const alertAppearances = {
  outline: {
    primary: 'inset-ring inset-ring-line',
    success: 'inset-ring light:inset-ring-green-600 light:text-green-700 dark:inset-ring-green-500 dark:text-green-400',
    warning:
      'inset-ring light:inset-ring-orange-600 light:text-orange-700 dark:inset-ring-orange-500 dark:text-orange-400',
    caution:
      'inset-ring light:inset-ring-yellow-600 light:text-yellow-700 dark:inset-ring-yellow-500 dark:text-yellow-400',
    danger: 'inset-ring light:inset-ring-red-600 light:text-red-600 dark:inset-ring-red-500 dark:text-red-400',
    info: 'inset-ring light:inset-ring-blue-600 light:text-blue-600 dark:inset-ring-blue-400 dark:text-blue-300',
    discovery:
      'inset-ring light:inset-ring-purple-600 light:text-purple-600 dark:inset-ring-purple-400 dark:text-purple-300',
  },
  soft: {
    primary: 'inset-ring light:bg-stone-950/4 light:inset-ring-stone-950/6 dark:bg-white/6 dark:inset-ring-white/8',
    success:
      'inset-ring light:bg-green-500/6 light:inset-ring-green-500/16 light:text-green-700 dark:bg-green-400/10 dark:inset-ring-green-400/20 dark:text-green-400',
    warning:
      'inset-ring light:bg-orange-500/6 light:inset-ring-orange-500/16 light:text-orange-700 dark:bg-orange-400/10 dark:inset-ring-orange-400/20 dark:text-orange-400',
    caution:
      'inset-ring light:bg-yellow-500/8 light:inset-ring-yellow-500/20 light:text-yellow-800 dark:bg-yellow-400/10 dark:inset-ring-yellow-400/20 dark:text-yellow-400',
    danger:
      'inset-ring light:bg-red-500/6 light:inset-ring-red-500/16 light:text-red-600 dark:bg-red-400/10 dark:inset-ring-red-400/20 dark:text-red-400',
    info: 'inset-ring light:bg-blue-500/6 light:inset-ring-blue-500/16 light:text-blue-600 dark:bg-blue-400/10 dark:inset-ring-blue-400/20 dark:text-blue-300',
    discovery:
      'inset-ring light:bg-purple-500/6 light:inset-ring-purple-500/16 light:text-purple-600 dark:bg-purple-400/10 dark:inset-ring-purple-400/20 dark:text-purple-300',
  },
  solid: {
    primary: 'light:bg-neutral-900 light:text-white dark:bg-stone-200 dark:text-stone-950',
    success: 'light:bg-green-600 light:text-white dark:bg-green-600 dark:text-white',
    warning: 'light:bg-orange-600 light:text-white dark:bg-orange-600 dark:text-white',
    caution: 'light:bg-yellow-700 light:text-white dark:bg-yellow-700 dark:text-white',
    danger: 'light:bg-red-600 light:text-white dark:bg-red-600 dark:text-white',
    info: 'light:bg-blue-600 light:text-white dark:bg-blue-500 dark:text-white',
    discovery: 'light:bg-purple-600 light:text-white dark:bg-purple-500 dark:text-white',
  },
} satisfies Record<string, Record<string, string>>

type AlertVariantName = keyof typeof alertAppearances
type AlertColorName = keyof typeof alertAppearances.outline

const alertVariantNames = Object.keys(alertAppearances) as AlertVariantName[]
const alertColorNames = Object.keys(alertAppearances.outline) as AlertColorName[]

const alertAppearanceCompounds = alertVariantNames.flatMap((variantName) =>
  alertColorNames.map((colorName) => ({
    variant: variantName,
    color: colorName,
    class: { root: alertAppearances[variantName][colorName] },
  })),
)

export const alertTheme = tv({
  slots: {
    root: '@container w-full rounded-xl p-4 text-sm leading-5',
    body: 'flex gap-3',
    icon: 'size-5 shrink-0',
    content: 'min-w-0 flex-1',
    wrapper: 'min-w-0 flex-1',
    title: 'font-semibold text-pretty',
    description: 'text-pretty',
    actions: 'flex shrink-0 gap-2',
  },
  variants: {
    variant: {
      outline: '',
      soft: '',
      solid: '',
    },
    color: {
      primary: '',
      success: '',
      warning: '',
      caution: '',
      danger: '',
      info: '',
      discovery: '',
    },
    actionsPlacement: {
      end: '',
      bottom: '',
    },
    hasActions: {
      true: '',
      false: { body: 'items-center' },
    },
    hasTitle: {
      true: { description: 'mt-0.5' },
    },
  },
  compoundVariants: [
    ...alertAppearanceCompounds,
    {
      hasActions: true,
      actionsPlacement: 'end',
      class: {
        body: 'items-start @md:items-center',
        content: '@md:flex @md:items-center @md:justify-between',
        actions: 'mt-4 @md:mt-0 @md:ml-4',
      },
    },
    {
      hasActions: true,
      actionsPlacement: 'bottom',
      class: { body: 'items-start', actions: 'mt-4' },
    },
  ],
})

export type AlertThemeVariants = VariantProps<typeof alertTheme>

export type AlertSlotName = keyof ReturnType<typeof alertTheme>
