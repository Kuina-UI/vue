<script lang="ts">
import type { ClassNameValue } from '../../shared/utils/tv'
import type { CircularProgressSlotName } from './circular-progress.theme'

export interface CircularProgressProps {
  progress: number
  label?: string
  ui?: Partial<Record<CircularProgressSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { circularProgressTheme } from './circular-progress.theme'

const props = withDefaults(defineProps<CircularProgressProps>(), {
  label: 'Progress',
})

const progressCircleLength = 50

const circularProgressSlots = circularProgressTheme()

const clampedProgress = computed(() => Math.min(Math.max(props.progress, 0), 100))

const indicatorDashOffset = computed(() => progressCircleLength - (progressCircleLength * clampedProgress.value) / 100)
</script>

<template>
  <svg
    viewBox="0 0 20 20"
    role="progressbar"
    :aria-label="label"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="clampedProgress"
    :class="circularProgressSlots.base({ class: [ui?.base, props.class] })"
  >
    <circle cx="10" cy="10" r="8" :class="circularProgressSlots.track({ class: ui?.track })" />
    <circle
      cx="10"
      cy="10"
      r="8"
      :stroke-dasharray="progressCircleLength"
      :stroke-dashoffset="indicatorDashOffset"
      stroke-linecap="round"
      :class="circularProgressSlots.indicator({ class: ui?.indicator })"
    />
  </svg>
</template>
