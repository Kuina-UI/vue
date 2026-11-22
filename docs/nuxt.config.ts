export default defineNuxtConfig({
  extends: ['docus'],
  site: {
    name: 'Kuina UI',
  },
  mdc: {
    highlight: {
      noApiRoute: false,
    },
  },
})
