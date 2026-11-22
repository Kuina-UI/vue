<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const { sidebarNavigation, currentSection } = useSubNavigation()

const contentNavVariants = useUIConfig('contentNavigation')

function toSidebarLink({ icon, ...navigationItem }: ContentNavigationItem): ContentNavigationItem {
  return { ...navigationItem, exact: true }
}

const groupedNavigation = computed<ContentNavigationItem[]>(() => {
  const standalonePages = sidebarNavigation.value.filter(navigationItem => !navigationItem.children?.length)
  const pageGroups = sidebarNavigation.value
    .filter(navigationItem => navigationItem.children?.length)
    .map(pageGroup => ({ ...pageGroup, children: pageGroup.children?.map(toSidebarLink) }))

  if (!standalonePages.length) {
    return pageGroups
  }

  return [
    {
      title: 'Overview',
      path: currentSection.value?.path ?? '/',
      children: standalonePages.map(toSidebarLink),
    },
    ...pageGroups,
  ]
})
</script>

<template>
  <UContentNavigation
    :collapsible="false"
    :highlight="contentNavVariants.highlight ?? true"
    :highlight-color="contentNavVariants.highlightColor"
    :variant="contentNavVariants.variant ?? 'link'"
    :color="contentNavVariants.color"
    :navigation="groupedNavigation"
  />
</template>
