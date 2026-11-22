<script setup lang="ts">
import type { Framework } from '~/composables/useFrameworks'

const { framework, setFramework, frameworks } = useFrameworks()

const selectedFramework = ref<Framework>('nuxt')

onMounted(() => {
  selectedFramework.value = framework.value
})

watch(framework, () => {
  selectedFramework.value = framework.value
})
</script>

<template>
  <UTabs
    v-model="selectedFramework"
    :items="frameworks"
    :content="false"
    color="neutral"
    size="xs"
    :ui="{
      indicator: 'bg-default',
      trigger: 'px-1 w-full data-[state=active]:text-highlighted',
    }"
    @update:model-value="setFramework($event as Framework)"
  />
</template>
