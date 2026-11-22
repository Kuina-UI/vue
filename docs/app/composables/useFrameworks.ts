export type Framework = 'nuxt' | 'vue'

export const frameworkCookieName = 'kuina-ui-framework'

export function useFrameworks() {
  const framework = useCookie<Framework>(frameworkCookieName, { default: () => 'nuxt' })

  function setFramework(selectedFramework: Framework) {
    framework.value = selectedFramework
  }

  const frameworks = [
    { label: 'Nuxt', icon: 'i-simple-icons-nuxtdotjs', value: 'nuxt' },
    { label: 'Vue', icon: 'i-simple-icons-vuedotjs', value: 'vue' },
  ]

  return {
    framework,
    setFramework,
    frameworks,
  }
}
