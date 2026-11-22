/** Prerendered pages cannot read the framework cookie, so an inline script sets `data-framework` before the first paint. */
export default defineNuxtPlugin({
  enforce: 'post',
  setup() {
    const { framework } = useFrameworks()

    if (import.meta.client) {
      useHead({
        htmlAttrs: {
          'data-framework': framework,
        },
      })
    }

    if (import.meta.server) {
      useHead({
        script: [
          {
            innerHTML: `document.documentElement.setAttribute('data-framework', (document.cookie.match(/(?:^|; )${frameworkCookieName}=([^;]*)/) || [])[1] || 'nuxt');`,
            tagPriority: 'critical',
          },
        ],
      })
    }
  },
})
