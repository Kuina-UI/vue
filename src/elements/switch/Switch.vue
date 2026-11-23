<script lang="ts">
import type { ClassNameValue } from '../../shared/utils/tv'
import type { SwitchSlotName, SwitchThemeVariants } from './switch.theme'

export interface SwitchProps {
  label?: string
  description?: string
  color?: SwitchThemeVariants['color'] | (string & {})
  labelPosition?: SwitchThemeVariants['labelPosition']
  block?: boolean
  disabled?: boolean
  ui?: Partial<Record<SwitchSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { useCustomColor } from '../../shared/composables/useCustomColor'
import { switchTheme } from './switch.theme'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<SwitchProps>(), {
  color: 'neutral',
  labelPosition: 'end',
})

const isChecked = defineModel<boolean>({ default: false })

const { themeColor, customColorVariable } = useCustomColor(() => props.color, switchTheme.variants.color)

const switchId = useId()
const labelId = `${switchId}-label`
const descriptionId = `${switchId}-description`

const hasDescription = computed(() => Boolean(props.label && props.description))

const switchSlots = computed(() =>
  switchTheme({
    color: themeColor.value,
    labelPosition: props.labelPosition,
    block: props.block,
    disabled: props.disabled,
    hasLabel: Boolean(props.label),
  }),
)
</script>

<template>
  <label :class="switchSlots.root({ class: [ui?.root, props.class] })" :style="customColorVariable">
    <span :class="switchSlots.base({ class: ui?.base })">
      <input
        v-bind="$attrs"
        v-model="isChecked"
        :checked="isChecked"
        type="checkbox"
        role="switch"
        :disabled="disabled"
        :aria-labelledby="hasDescription ? labelId : undefined"
        :aria-describedby="hasDescription ? descriptionId : undefined"
        class="peer sr-only"
      />
      <span aria-hidden="true" :class="switchSlots.thumb({ class: ui?.thumb })" />
    </span>

    <span v-if="hasDescription" :class="switchSlots.wrapper({ class: ui?.wrapper })">
      <span :id="labelId" :class="switchSlots.label({ class: ui?.label })">{{ label }}</span>
      <span :id="descriptionId" :class="switchSlots.description({ class: ui?.description })">{{ description }}</span>
    </span>

    <template v-else-if="label">{{ label }}</template>
  </label>
</template>
