<script lang="ts">
import type { Component } from 'vue'
import type { FloatingAlign, FloatingSide, FloatingStrategy } from '../../shared/types/floating-position'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { SelectFieldControlSlotName, SelectFieldControlThemeVariants } from '../../elements/select-field-control'
import type { SelectPanelSlotName } from './select-panel.theme'
import type { SelectOption, SelectOptionEntry } from './selectOptions'
import type { SelectAction } from './useSelectListbox'

export interface SelectFieldProps<
  SourceOption = SelectOption,
  ValueKey extends string = 'value',
  Multiple extends boolean = false,
> {
  label: string
  options: SelectOptionEntry<SourceOption>[]
  id?: string
  multiple?: Multiple & boolean
  valueKey?: ValueKey
  labelKey?: string
  descriptionKey?: string
  avatarKey?: string
  placeholder?: string
  searchable?: boolean
  searchPlacement?: 'list' | 'field'
  searchPlaceholder?: string
  clearable?: boolean
  clearLabel?: string
  loading?: boolean
  loadingLabel?: string
  noResultsLabel?: (searchQuery: string) => string
  selectionLabel?: (selectedOptions: SourceOption[]) => string
  actions?: SelectAction[]
  name?: string
  hint?: string
  errorMessage?: string
  invalid?: boolean
  disabled?: boolean
  size?: SelectFieldControlThemeVariants['size']
  variant?: SelectFieldControlThemeVariants['variant']
  pill?: boolean
  floatLabel?: SelectFieldControlThemeVariants['floatLabel']
  leadingIcon?: Component
  trailingIcon?: Component | null
  side?: FloatingSide
  align?: FloatingAlign
  flip?: boolean
  strategy?: FloatingStrategy
  ui?: Partial<Record<SelectFieldControlSlotName | SelectPanelSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts" generic="SourceOption = SelectOption, ValueKey extends string = 'value', Multiple extends boolean = false">
import { computed, type Ref, useTemplateRef } from 'vue'
import { type AvatarProps, KAvatar } from '../../elements/avatar'
import { KLoadingIndicator } from '../../elements/loading-indicator'
import { KSelectFieldControl } from '../../elements/select-field-control'
import { useFieldDescription } from '../../shared/composables/useFieldDescription'
import type { SelectModelValue, SelectSlots } from './Select.vue'
import SelectPanel from './SelectPanel.vue'
import { useSelectControl } from './useSelectControl'

const props = withDefaults(defineProps<SelectFieldProps<SourceOption, ValueKey, Multiple>>(), {
  labelKey: 'label',
  descriptionKey: 'description',
  avatarKey: 'avatar',
  searchPlacement: 'list',
  searchPlaceholder: 'Search...',
  clearLabel: 'Clear current value',
  loadingLabel: 'Loading...',
  noResultsLabel: (searchQuery: string) => `No results for “${searchQuery}”`,
  actions: () => [],
  size: '4xl',
  variant: 'outline',
  pill: true,
  floatLabel: 'auto',
  side: 'bottom',
  align: 'start',
  flip: true,
  strategy: 'absolute',
})

const slots = defineSlots<SelectSlots<SourceOption>>()

const selectedValue = defineModel<SelectModelValue<SourceOption, ValueKey, Multiple>>()
const isOpen = defineModel<boolean>('open', { default: false })

const triggerAvatarSizes: Record<NonNullable<SelectFieldControlThemeVariants['size']>, AvatarProps['size']> = {
  'md': '3xs',
  'lg': '3xs',
  'xl': '2xs',
  '2xl': 'xs',
  '3xl': 'sm',
  '4xl': 'md',
}

const selectFieldControl = useTemplateRef<InstanceType<typeof KSelectFieldControl>>('selectFieldControl')
const selectFieldContainer = computed(() => selectFieldControl.value?.containerElement ?? null)
const selectFieldTrigger = computed(() => selectFieldControl.value?.triggerElement ?? null)
const selectFieldInput = useTemplateRef<HTMLInputElement>('selectFieldInput')
const selectFieldLayer = useTemplateRef<HTMLElement>('selectFieldLayer')

const focusedTriggerElement = computed(() =>
  props.searchable && props.searchPlacement === 'field' ? selectFieldInput.value : selectFieldTrigger.value,
)

const { fieldId, hintId, errorMessageId, isInvalid, describingElementId } = useFieldDescription(props)

const labelId = computed(() => `${fieldId.value}-label`)

const {
  listboxId,
  searchQuery,
  highlightedItemId,
  visibleEntries,
  selectedValues,
  isOptionSelected,
  highlightItem,
  toggleListbox,
  selectOption,
  runSelectAction,
  handleTriggerKeydown,
  handleSearchKeydown,
  handleSearchTriggerKeydown,
  handleSearchTriggerPaste,
  searchesInTrigger,
  navigatesFromTrigger,
  triggerSearchValue,
  openTriggerSearchFromClick,
  searchFromTriggerInput,
  hasSelection,
  selectedSourceOptions,
  selectedLabels,
  selectionText,
  announcesSelectedLabelsSeparately,
  selectedAvatar,
  resolvedTrailingIcon,
  showsTrailingIcon,
  showsClearButton,
  clearSelectionFromButton,
} = useSelectControl(props, {
  selectedValue: selectedValue as Ref<unknown>,
  isOpen,
  rootElement: selectFieldContainer,
  triggerElement: focusedTriggerElement,
  layerElement: selectFieldLayer,
  hasSelectionSlot: () => Boolean(slots.selection),
})

const triggerAvatar = computed(() =>
  selectedAvatar.value ? { ...selectedAvatar.value, size: triggerAvatarSizes[props.size] } : undefined,
)

const comboboxAttributes = computed(() => ({
  'id': fieldId.value,
  'role': 'combobox',
  'aria-labelledby': labelId.value,
  'aria-haspopup': 'listbox' as const,
  'aria-expanded': isOpen.value,
  'aria-controls': isOpen.value ? listboxId : undefined,
  'aria-activedescendant': isOpen.value && navigatesFromTrigger.value ? highlightedItemId.value : undefined,
  'aria-describedby': describingElementId.value,
  'aria-invalid': isInvalid.value || undefined,
  'aria-busy': props.loading || undefined,
}))

const searchFieldPlaceholder = computed(() =>
  hasSelection.value ? selectionText.value : (props.placeholder ?? props.searchPlaceholder),
)

const triggerAttributes = computed(() => {
  if (searchesInTrigger.value) {
    return { onClick: (clickEvent: MouseEvent) => openTriggerSearchFromClick(clickEvent, selectFieldInput.value) }
  }

  return {
    ...comboboxAttributes.value,
    'tabindex': props.disabled ? -1 : 0,
    'aria-disabled': props.disabled || undefined,
    'onClick': toggleListbox,
    'onKeydown': handleTriggerKeydown,
  }
})

</script>

<template>
  <KSelectFieldControl
    ref="selectFieldControl"
    :label="label"
    :label-id="labelId"
    :hint-id="hintId"
    :error-message-id="errorMessageId"
    :placeholder="placeholder"
    :hint="hint"
    :error-message="errorMessage"
    :size="size"
    :variant="variant"
    :pill="pill"
    :float-label="floatLabel"
    :open="isOpen"
    :invalid="isInvalid"
    :disabled="disabled"
    :has-value="hasSelection"
    :leading-icon="leadingIcon"
    :trailing-icon="showsTrailingIcon ? resolvedTrailingIcon : null"
    :shows-clear-button="showsClearButton"
    :clear-label="clearLabel"
    :spoken-value="announcesSelectedLabelsSeparately ? selectedLabels : undefined"
    :trigger-attributes="triggerAttributes"
    :ui="ui"
    :class="props.class"
    @clear="clearSelectionFromButton"
  >
    <template v-if="triggerAvatar" #leading>
      <KAvatar v-bind="triggerAvatar" />
    </template>

    <template v-if="searchesInTrigger" #input="{ inputClass }">
      <input
        ref="selectFieldInput"
        v-bind="comboboxAttributes"
        type="text"
        aria-autocomplete="list"
        autocomplete="off"
        :spellcheck="false"
        :disabled="disabled"
        :value="triggerSearchValue"
        :placeholder="searchFieldPlaceholder"
        :class="inputClass"
        @input="searchFromTriggerInput"
        @keydown="handleSearchTriggerKeydown"
        @paste="handleSearchTriggerPaste"
      />
    </template>

    <slot name="selection" :selected-options="selectedSourceOptions">{{ selectionText }}</slot>

    <template v-if="loading" #status="{ statusClass }">
      <KLoadingIndicator :label="loadingLabel" :class="statusClass" />
    </template>

    <template #popup>
      <template v-if="name">
        <input
          v-for="(submittedValue, submittedValueIndex) in selectedValues"
          :key="submittedValueIndex"
          type="hidden"
          :name="name"
          :value="String(submittedValue)"
        />
      </template>

      <Teleport to="body">
        <div v-if="isOpen" ref="selectFieldLayer">
          <SelectPanel
            v-model:search-query="searchQuery"
            :listbox-id="listboxId"
            :label="label"
            :visible-entries="visibleEntries"
            :is-option-selected="isOptionSelected"
            :highlighted-item-id="highlightedItemId"
            :multiple="Boolean(multiple)"
            :shows-search-input="searchable && !searchesInTrigger"
            :search-placeholder="searchPlaceholder"
            :no-results-label="noResultsLabel"
            :actions="actions"
            :anchor-element="selectFieldContainer"
            :side="side"
            :align="align"
            :flip="flip"
            :strategy="strategy"
            :ui="ui"
            @select-option="selectOption"
            @run-select-action="runSelectAction"
            @highlight-item="highlightItem"
            @search-keydown="handleSearchKeydown"
          >
            <template v-if="slots.option" #option="optionSlotProps">
              <slot name="option" :option="optionSlotProps.option as SourceOption" :selected="optionSlotProps.selected" />
            </template>
            <template v-if="slots.search" #search="searchSlotProps">
              <slot name="search" v-bind="searchSlotProps" />
            </template>
          </SelectPanel>
        </div>
      </Teleport>
    </template>
  </KSelectFieldControl>
</template>
