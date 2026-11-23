import { computed, type MaybeRefOrGetter, toValue } from 'vue'

/** Resolve a color prop to a theme color name, or to the primary color redefined with any other CSS color. */
export function useCustomColor<ThemeColorName extends string>(
  color: MaybeRefOrGetter<string>,
  themeColors: Record<ThemeColorName, unknown>,
) {
  const isThemeColor = computed(() => toValue(color) in themeColors)

  const themeColor = computed(() => (isThemeColor.value ? toValue(color) : 'primary') as ThemeColorName)

  const customColorVariable = computed(() => (isThemeColor.value ? undefined : { '--color-primary': toValue(color) }))

  return { themeColor, customColorVariable }
}
