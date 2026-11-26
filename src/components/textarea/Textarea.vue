<script lang="ts">
import type { ClassNameValue } from '../../shared/utils/tv'
import type { TextareaSlotName, TextareaThemeVariants } from './textarea.theme'

export interface TextareaProps {
  label: string
  id?: string
  placeholder?: string
  rows?: number
  autoResize?: boolean
  maxRows?: number
  maxlength?: number
  variant?: TextareaThemeVariants['variant']
  size?: TextareaThemeVariants['size']
  pill?: boolean
  floatLabel?: TextareaThemeVariants['floatLabel']
  hint?: string
  errorMessage?: string
  invalid?: boolean
  disabled?: boolean
  ui?: Partial<Record<TextareaSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next'
import { computed } from 'vue'
import { useFieldDescription } from '../../shared/composables/useFieldDescription'
import { textareaTheme } from './textarea.theme'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<TextareaProps>(), {
  rows: 3,
  maxRows: 10,
  variant: 'outline',
  size: '4xl',
  pill: true,
  floatLabel: 'auto',
})

const fieldValue = defineModel<string>()

const { fieldId, hintId, errorMessageId, isInvalid, describingElementId } = useFieldDescription(props)

const textareaSlots = computed(() =>
  textareaTheme({
    variant: props.variant,
    size: props.size,
    pill: props.pill,
    floatLabel: props.floatLabel,
    autoResize: props.autoResize,
    invalid: isInvalid.value,
    disabled: props.disabled,
  }),
)

const autoResizeRowLimits = computed(() =>
  props.autoResize ? { '--textarea-min-rows': props.rows, '--textarea-max-rows': props.maxRows } : undefined,
)

const enteredCharacterCount = computed(() => fieldValue.value?.length ?? 0)

const hasFooter = computed(() => Boolean(props.errorMessage || props.hint || props.maxlength))
</script>

<template>
  <div :class="textareaSlots.root({ class: [ui?.root, props.class] })">
    <div :class="textareaSlots.container({ class: ui?.container })">
      <textarea
        v-bind="$attrs"
        :id="fieldId"
        v-model="fieldValue"
        :rows="rows"
        :maxlength="maxlength"
        :disabled="disabled"
        :aria-describedby="describingElementId"
        :aria-invalid="isInvalid || undefined"
        :style="autoResizeRowLimits"
        :placeholder="floatLabel === 'always' ? placeholder : ' '"
        :class="textareaSlots.base({ class: ui?.base })"
      />

      <label :for="fieldId" :class="textareaSlots.label({ class: ui?.label })">{{ label }}</label>
    </div>

    <div v-if="hasFooter" :class="textareaSlots.footer({ class: ui?.footer })">
      <p v-if="errorMessage" :id="errorMessageId" :class="textareaSlots.errorMessage({ class: ui?.errorMessage })">
        <CircleAlert :class="textareaSlots.errorIcon({ class: ui?.errorIcon })" />
        {{ errorMessage }}
      </p>

      <p v-else-if="hint" :id="hintId" :class="textareaSlots.hint({ class: ui?.hint })">{{ hint }}</p>

      <p v-if="maxlength" :class="textareaSlots.characterCount({ class: ui?.characterCount })">
        {{ enteredCharacterCount }}/{{ maxlength }}
      </p>
    </div>
  </div>
</template>
