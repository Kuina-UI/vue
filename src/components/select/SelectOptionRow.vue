<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { computed } from 'vue'
import { KAvatar } from '../../elements/avatar'
import type { ClassNameValue } from '../../shared/utils/tv'
import { type SelectPanelSlotName, selectPanelTheme } from './select-panel.theme'
import type { ResolvedSelectOption } from './selectOptions'

const props = defineProps<{
  resolvedOption: ResolvedSelectOption
  selected: boolean
  highlighted: boolean
  ui?: Partial<Record<SelectPanelSlotName, ClassNameValue>>
}>()

const emit = defineEmits<{
  select: []
  highlight: []
}>()

const optionLayout = computed(() => {
  if (!props.resolvedOption.avatar) return 'text'
  return props.resolvedOption.description ? 'avatarWithDescription' : 'avatar'
})

const optionSlots = computed(() =>
  selectPanelTheme({
    optionSelected: props.selected,
    optionDisabled: props.resolvedOption.disabled,
    highlighted: props.highlighted,
    optionLayout: optionLayout.value,
  }),
)

const avatarInitials = computed(
  () => props.resolvedOption.avatar?.initials ?? props.resolvedOption.label.charAt(0).toUpperCase(),
)

function highlightEnabledOption() {
  if (!props.resolvedOption.disabled && !props.highlighted) emit('highlight')
}
</script>

<template>
  <div
    :id="resolvedOption.optionId"
    role="option"
    :aria-selected="selected"
    :aria-disabled="resolvedOption.disabled || undefined"
    :class="optionSlots.option({ class: ui?.option })"
    @pointermove="highlightEnabledOption"
    @click="emit('select')"
  >
    <span :class="optionSlots.optionIndicator({ class: ui?.optionIndicator })">
      <Check v-if="selected" :class="optionSlots.optionCheckIcon({ class: ui?.optionCheckIcon })" />
    </span>
    <slot :option="resolvedOption.sourceOption" :selected="selected">
      <span v-if="resolvedOption.avatar" :class="optionSlots.optionAvatar({ class: ui?.optionAvatar })">
        <KAvatar
          v-bind="resolvedOption.avatar"
          :initials="avatarInitials"
          :size="optionLayout === 'avatarWithDescription' ? 'md' : '2xs'"
        />
      </span>
      <span :class="optionSlots.optionText({ class: ui?.optionText })">
        <span :class="optionSlots.optionLabel({ class: ui?.optionLabel })">{{ resolvedOption.label }}</span>
        <span v-if="resolvedOption.description" :class="optionSlots.optionDescription({ class: ui?.optionDescription })">
          {{ resolvedOption.description }}
        </span>
      </span>
    </slot>
  </div>
</template>
