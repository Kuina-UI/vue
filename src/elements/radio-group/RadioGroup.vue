<script lang="ts">
import type { ClassNameValue } from '../../shared/utils/tv'
import type { RadioGroupSlotName, RadioGroupThemeVariants } from './radio-group.theme'

export interface RadioGroupOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps {
  label: string
  options: RadioGroupOption[]
  name?: string
  direction?: RadioGroupThemeVariants['direction']
  variant?: RadioGroupThemeVariants['variant']
  color?: RadioGroupThemeVariants['color'] | (string & {})
  hideLabel?: boolean
  disabled?: boolean
  errorMessage?: string
  ui?: Partial<Record<RadioGroupSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next'
import { computed, useId } from 'vue'
import { useCustomColor } from '../../shared/composables/useCustomColor'
import { radioGroupTheme } from './radio-group.theme'

const props = withDefaults(defineProps<RadioGroupProps>(), {
  direction: 'row',
  variant: 'default',
  color: 'neutral',
})

const selectedValue = defineModel<string>()

const { themeColor, customColorVariable } = useCustomColor(() => props.color, radioGroupTheme.variants.color)

const radioGroupId = useId()
const errorMessageId = `${radioGroupId}-error`

const radioGroupName = computed(() => props.name ?? radioGroupId)

const radioGroupSlots = computed(() =>
  radioGroupTheme({
    variant: props.variant,
    direction: props.direction,
    color: themeColor.value,
    hideLabel: props.hideLabel,
    hasDescriptions: props.options.some((option) => option.description),
    invalid: Boolean(props.errorMessage),
  }),
)

function createOptionId(optionIndex: number) {
  return `${radioGroupId}-option-${optionIndex}`
}

function isOptionDisabled(option: RadioGroupOption) {
  return props.disabled || Boolean(option.disabled)
}
</script>

<template>
  <fieldset
    role="radiogroup"
    :disabled="disabled"
    :aria-invalid="errorMessage ? 'true' : undefined"
    :aria-describedby="errorMessage ? errorMessageId : undefined"
    :class="radioGroupSlots.root({ class: [ui?.root, props.class] })"
    :style="customColorVariable"
  >
    <legend :class="radioGroupSlots.legend({ class: ui?.legend })">{{ label }}</legend>

    <div :class="radioGroupSlots.optionList({ class: ui?.optionList })">
      <label
        v-for="(option, optionIndex) in options"
        :key="option.value"
        :class="
          radioGroupSlots.option({
            optionDisabled: isOptionDisabled(option),
            optionHasDescription: Boolean(option.description),
            class: ui?.option,
          })
        "
      >
        <span :class="radioGroupSlots.container({ class: ui?.container })">
          <span :class="radioGroupSlots.base({ optionDisabled: isOptionDisabled(option), class: ui?.base })">
            <input
              v-model="selectedValue"
              type="radio"
              :name="radioGroupName"
              :value="option.value"
              :disabled="option.disabled"
              :aria-labelledby="option.description ? `${createOptionId(optionIndex)}-label` : undefined"
              :aria-describedby="option.description ? `${createOptionId(optionIndex)}-description` : undefined"
              class="peer sr-only"
            />
            <span aria-hidden="true" :class="radioGroupSlots.indicator({ class: ui?.indicator })" />
          </span>
        </span>

        <span v-if="option.description" :class="radioGroupSlots.wrapper({ class: ui?.wrapper })">
          <span :id="`${createOptionId(optionIndex)}-label`" :class="radioGroupSlots.label({ class: ui?.label })">
            {{ option.label }}
          </span>
          <span
            :id="`${createOptionId(optionIndex)}-description`"
            :class="radioGroupSlots.description({ class: ui?.description })"
          >
            {{ option.description }}
          </span>
        </span>

        <template v-else>{{ option.label }}</template>
      </label>
    </div>

    <p v-if="errorMessage" :id="errorMessageId" :class="radioGroupSlots.errorMessage({ class: ui?.errorMessage })">
      <CircleAlert :class="radioGroupSlots.errorIcon({ class: ui?.errorIcon })" />
      {{ errorMessage }}
    </p>
  </fieldset>
</template>
