<script lang="ts">
import type { ClassNameValue } from '../../shared/utils/tv'
import type { CheckboxSlotName, CheckboxThemeVariants } from './checkbox.theme'

export interface CheckboxProps {
  label: string
  color?: CheckboxThemeVariants['color'] | (string & {})
  labelPosition?: CheckboxThemeVariants['labelPosition']
  ui?: Partial<Record<CheckboxSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { checkboxTheme } from './checkbox.theme'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<CheckboxProps>(), {
  color: 'neutral',
  labelPosition: 'end',
})

const isChecked = defineModel<boolean>({ default: false })

const isThemeColor = computed(() => props.color in checkboxTheme.variants.color)

const checkboxSlots = computed(() =>
  checkboxTheme({
    color: isThemeColor.value ? (props.color as CheckboxThemeVariants['color']) : 'primary',
    labelPosition: props.labelPosition,
  }),
)

const customColorVariable = computed(() => (isThemeColor.value ? undefined : { '--color-primary': props.color }))
</script>

<template>
  <label :class="checkboxSlots.root({ class: [ui?.root, props.class] })" :style="customColorVariable">
    <span :class="checkboxSlots.base({ class: ui?.base })">
      <input v-bind="$attrs" v-model="isChecked" type="checkbox" class="peer sr-only" />
      <span aria-hidden="true" :class="checkboxSlots.checkMark({ class: ui?.checkMark })" />
    </span>
    {{ label }}
  </label>
</template>
