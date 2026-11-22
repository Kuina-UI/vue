export default defineAppConfig({
  header: {
    title: 'Kuina UI',
  },
  github: {
    url: 'https://github.com/Kuina-UI/vue',
    branch: 'main',
    rootDir: 'docs',
  },
  navigation: {
    sub: 'header',
  },
  ui: {
    colors: {
      primary: 'green',
      neutral: 'slate',
    },
    contentNavigation: {
      defaultVariants: {
        variant: 'pill',
        highlight: true,
      },
    },
  },
})
