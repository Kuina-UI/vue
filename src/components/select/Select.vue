<script lang="ts">
import type { Component, InputHTMLAttributes } from 'vue'
import type { FloatingAlign, FloatingSide, FloatingStrategy } from '../../shared/types/floating-position'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { SelectPanelSlotName } from './select-panel.theme'
import type { SelectControlSlotName, SelectControlThemeVariants } from '../../elements/select-control'
import type { SelectOption, SelectOptionEntry } from './selectOptions'
import type { SelectAction } from './useSelectListbox'

type ValueAtFieldPath<SourceOption, FieldPath extends string> = FieldPath extends `${infer FieldName}.${infer RemainingPath}`
  ? FieldName extends keyof SourceOption
    ? ValueAtFieldPath<NonNullable<SourceOption[FieldName]>, RemainingPath>
    : unknown
  : FieldPath extends keyof SourceOption
    ? SourceOption[FieldPath]
    : unknown

export type SelectOptionValue<SourceOption, ValueKey extends string> = SourceOption extends string | number
  ? SourceOption
  : ValueAtFieldPath<SourceOption, ValueKey>

export type SelectModelValue<SourceOption, ValueKey extends string, Multiple extends boolean> = Multiple extends true
  ? SelectOptionValue<SourceOption, ValueKey>[]
  : SelectOptionValue<SourceOption, ValueKey> | undefined

export interface SelectProps<SourceOption = SelectOption, ValueKey extends string = 'value', Multiple extends boolean = false> {
  label: string
  options: SelectOptionEntry<SourceOption>[]
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
  loadingPlaceholder?: string
  noResultsLabel?: (searchQuery: string) => string
  selectionLabel?: (selectedOptions: SourceOption[]) => string
  actions?: SelectAction[]
  name?: string
  disabled?: boolean
  invalid?: boolean
  size?: SelectControlThemeVariants['size']
  variant?: SelectControlThemeVariants['variant']
  pill?: boolean
  block?: boolean
  leadingIcon?: Component
  trailingIcon?: Component | null
  side?: FloatingSide
  align?: FloatingAlign
  flip?: boolean
  strategy?: FloatingStrategy
  ui?: Partial<Record<SelectControlSlotName | SelectPanelSlotName, ClassNameValue>>
  class?: ClassNameValue
}

export interface SelectSlots<SourceOption> {
  option?: (optionSlotProps: { option: SourceOption; selected: boolean }) => unknown
  selection?: (selectionSlotProps: { selectedOptions: SourceOption[] }) => unknown
  search?: (searchSlotProps: { searchAttributes: InputHTMLAttributes }) => unknown
}
</script>

<script setup lang="ts" generic="SourceOption = SelectOption, ValueKey extends string = 'value', Multiple extends boolean = false">
import { X } from 'lucide-vue-next'
import { computed, type Ref, useTemplateRef } from 'vue'
import { type AvatarProps, KAvatar } from '../../elements/avatar'
import { KLoadingIndicator } from '../../elements/loading-indicator'
import { KSelectControl } from '../../elements/select-control'
import SelectPanel from './SelectPanel.vue'
import { useSelectControl } from './useSelectControl'

const props = withDefaults(defineProps<SelectProps<SourceOption, ValueKey, Multiple>>(), {
  labelKey: 'label',
  descriptionKey: 'description',
  avatarKey: 'avatar',
  placeholder: 'Select...',
  searchPlacement: 'list',
  searchPlaceholder: 'Search...',
  clearLabel: 'Clear current value',
  loadingPlaceholder: 'Loading...',
  noResultsLabel: (searchQuery: string) => `No results for “${searchQuery}”`,
  actions: () => [],
  size: 'md',
  variant: 'outline',
  pill: true,
  block: true,
  side: 'bottom',
  align: 'start',
  flip: true,
  strategy: 'absolute',
})

const slots = defineSlots<SelectSlots<SourceOption>>()

const selectedValue = defineModel<SelectModelValue<SourceOption, ValueKey, Multiple>>()
const isOpen = defineModel<boolean>('open', { default: false })

const triggerAvatarSizes: Partial<Record<NonNullable<SelectControlThemeVariants['size']>, AvatarProps['size']>> = {
  'md': '3xs',
  'lg': '2xs',
  'xl': 'xs',
  '2xl': 'sm',
  '3xl': 'md',
  '4xl': 'lg',
}

const selectControl = useTemplateRef<InstanceType<typeof KSelectControl>>('selectControl')
const selectRoot = computed(() => selectControl.value?.rootElement ?? null)
const selectTrigger = computed(() => selectControl.value?.triggerElement ?? null)
const selectSearchInput = useTemplateRef<HTMLInputElement>('selectSearchInput')
const selectLayer = useTemplateRef<HTMLElement>('selectLayer')

const focusedTriggerElement = computed(() =>
  props.searchable && props.searchPlacement === 'field' ? selectSearchInput.value : selectTrigger.value,
)

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
  isOpenable,
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
  rootElement: selectRoot,
  triggerElement: focusedTriggerElement,
  layerElement: selectLayer,
  hasSelectionSlot: () => Boolean(slots.selection),
})

const triggerText = computed(() => {
  if (hasSelection.value) return selectionText.value
  return props.loading ? props.loadingPlaceholder : props.placeholder
})

const triggerSearchPlaceholder = computed(() => {
  if (hasSelection.value) return selectionText.value
  if (isOpen.value) return props.searchPlaceholder
  return props.loading ? props.loadingPlaceholder : props.placeholder
})

const comboboxAttributes = computed(() => ({
  'role': 'combobox',
  'aria-label': props.label,
  'aria-haspopup': 'listbox' as const,
  'aria-expanded': isOpen.value,
  'aria-controls': isOpen.value ? listboxId : undefined,
  'aria-activedescendant': isOpen.value && navigatesFromTrigger.value ? highlightedItemId.value : undefined,
  'aria-invalid': props.invalid || undefined,
  'aria-busy': props.loading || undefined,
}))

const triggerAttributes = computed(() => {
  if (searchesInTrigger.value) {
    return { onClick: (clickEvent: MouseEvent) => openTriggerSearchFromClick(clickEvent, selectSearchInput.value) }
  }

  return {
    ...comboboxAttributes.value,
    'tabindex': props.disabled ? -1 : 0,
    'aria-disabled': props.disabled || undefined,
    'onClick': toggleListbox,
    'onKeydown': handleTriggerKeydown,
  }
})

const triggerAvatar = computed(() => {
  const triggerAvatarSize = triggerAvatarSizes[props.size]
  return triggerAvatarSize && selectedAvatar.value ? { ...selectedAvatar.value, size: triggerAvatarSize } : undefined
})
</script>

<template>
  <KSelectControl
    ref="selectControl"
    :size="size"
    :variant="variant"
    :pill="pill"
    :block="block"
    :open="isOpen"
    :invalid="invalid"
    :disabled="disabled"
    :interactive="isOpenable"
    :has-value="hasSelection"
    :searches-in-trigger="searchesInTrigger"
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
        ref="selectSearchInput"
        v-bind="comboboxAttributes"
        type="text"
        aria-autocomplete="list"
        autocomplete="off"
        :spellcheck="false"
        :disabled="disabled"
        :value="triggerSearchValue"
        :placeholder="triggerSearchPlaceholder"
        :class="inputClass"
        @input="searchFromTriggerInput"
        @keydown="handleSearchTriggerKeydown"
        @paste="handleSearchTriggerPaste"
      />
    </template>

    <slot name="selection" :selected-options="selectedSourceOptions">{{ triggerText }}</slot>

    <template v-if="loading" #status="{ statusClass }">
      <KLoadingIndicator :label="loadingPlaceholder" :class="statusClass" />
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
        <div v-if="isOpen" ref="selectLayer">
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
            :anchor-element="selectRoot"
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
  </KSelectControl>
</template>
