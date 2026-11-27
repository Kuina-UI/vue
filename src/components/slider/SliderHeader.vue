<script lang="ts">
import type { ClassNameValue } from '../../shared/utils/tv'
import type { SliderSlotName } from './slider.theme'

export interface SliderHeaderProps {
  labelId: string
  labelTargetId: string
  label?: string
  showsResetButton: boolean
  resetLabel: string
  hidesResetButton: boolean
  disabled?: boolean
  ui?: Partial<Record<SliderSlotName, ClassNameValue>>
}

export interface SliderHeaderSlots {
  label?: () => unknown
  default?: () => unknown
}
</script>

<script setup lang="ts">
import { RotateCcw } from 'lucide-vue-next'
import { computed } from 'vue'
import { KButton } from '../../elements/button'
import { KTooltip } from '../../elements/tooltip'
import { sliderTheme } from './slider.theme'

const props = defineProps<SliderHeaderProps>()

const emit = defineEmits<{
  reset: []
  valueClick: [clickEvent: MouseEvent]
}>()

defineSlots<SliderHeaderSlots>()

const sliderSlots = computed(() => sliderTheme({ disabled: props.disabled, hidesResetButton: props.hidesResetButton }))
</script>

<template>
  <div :class="sliderSlots.header({ class: ui?.header })">
    <label :id="labelId" :for="labelTargetId" :class="sliderSlots.label({ class: ui?.label })">
      <slot name="label">{{ label }}</slot>
    </label>

    <span v-if="showsResetButton" :class="sliderSlots.reset({ class: ui?.reset })">
      <KTooltip :content="resetLabel" compact>
        <KButton
          :label="resetLabel"
          :leading-icon="RotateCcw"
          variant="ghost"
          color="gray"
          size="3xs"
          square
          :class="sliderSlots.resetButton({ class: ui?.resetButton })"
          @click="emit('reset')"
        />
      </KTooltip>
    </span>

    <div :class="sliderSlots.value({ class: ui?.value })" @click="emit('valueClick', $event)">
      <slot />
    </div>
  </div>
</template>
