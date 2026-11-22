<script setup lang="ts">
const route = useRoute()
const appConfig = useAppConfig()
const { subNavigationMode } = useSubNavigation()

const desktopLinks = computed(() => [
  {
    label: 'Docs',
    to: '/getting-started',
    active: route.meta.layout === 'docs',
  },
])
</script>

<template>
  <UHeader :ui="{ right: 'gap-0.5' }" :class="{ 'flex flex-col': subNavigationMode === 'header' }">
    <template #left>
      <AppHeaderLeft />
    </template>

    <UNavigationMenu :items="desktopLinks" variant="link" />

    <template #right>
      <UTooltip text="Search" :kbds="['meta', 'K']" ignore-non-keyboard-focus>
        <UContentSearchButton />
      </UTooltip>

      <ClientOnly>
        <UColorModeButton />

        <template #fallback>
          <div class="size-8 animate-pulse rounded-md bg-elevated" />
        </template>
      </ClientOnly>

      <UTooltip v-if="appConfig.github?.url" text="Open on GitHub" class="hidden lg:flex" ignore-non-keyboard-focus>
        <UButton
          color="neutral"
          variant="ghost"
          :to="appConfig.github.url"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="Open on GitHub"
        />
      </UTooltip>
    </template>

    <template #toggle="{ open, toggle }">
      <IconMenuToggle :open="open" class="lg:hidden" @click="toggle" />
    </template>

    <template #body>
      <AppHeaderBody />
    </template>

    <template v-if="subNavigationMode === 'header'" #bottom>
      <AppHeaderBottom />
    </template>
  </UHeader>
</template>
