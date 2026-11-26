<script lang="ts">
import type { Component } from 'vue'
import type { FloatingAlign, FloatingSide, FloatingStrategy } from '../../shared/types/floating-position'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { SelectFieldSlotName, SelectFieldThemeVariants } from './select-field.theme'
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
  size?: SelectFieldThemeVariants['size']
  variant?: SelectFieldThemeVariants['variant']
  pill?: boolean
  floatLabel?: SelectFieldThemeVariants['floatLabel']
  leadingIcon?: Component
  trailingIcon?: Component | null
  side?: FloatingSide
  align?: FloatingAlign
  flip?: boolean
  strategy?: FloatingStrategy
  ui?: Partial<Record<SelectFieldSlotName | SelectPanelSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts" generic="SourceOption = SelectOption, ValueKey extends string = 'value', Multiple extends boolean = false">
import { CircleAlert, X } from 'lucide-vue-next'
import { computed, type Ref, useTemplateRef } from 'vue'
import { KAvatar } from '../../elements/avatar'
import { KLoadingIndicator } from '../../elements/loading-indicator'
import { useFieldDescription } from '../../shared/composables/useFieldDescription'
import type { SelectModelValue, SelectSlots } from './Select.vue'
import SelectPanel from './SelectPanel.vue'
import { findSelectFieldAvatarSize, selectFieldTheme } from './select-field.theme'
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

const selectFieldContainer = useTemplateRef<HTMLElement>('selectFieldContainer')
const selectFieldTrigger = useTemplateRef<HTMLElement>('selectFieldTrigger')
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
  selectedAvatar.value ? { ...selectedAvatar.value, size: findSelectFieldAvatarSize(props.size ?? '4xl') } : undefined,
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

const fieldState = computed(() => {
  if (isInvalid.value) return 'invalid'
  if (props.disabled) return 'disabled'
  return isOpen.value ? 'open' : 'idle'
})

const selectFieldSlots = computed(() =>
  selectFieldTheme({
    size: props.size,
    variant: props.variant,
    pill: props.pill,
    fieldState: fieldState.value,
    floatLabel: props.floatLabel,
    labelFloating: props.floatLabel === 'always' || hasSelection.value || isOpen.value,
    hasLeadingIcon: Boolean(props.leadingIcon),
    disabled: props.disabled,
    open: isOpen.value,
    hasTrailingIcon: showsTrailingIcon.value,
  }),
)
</script>

<template>
  <div :class="selectFieldSlots.root({ class: [ui?.root, props.class] })">
    <div ref="selectFieldContainer" :class="selectFieldSlots.container({ class: ui?.container })">
      <template v-if="name">
        <input
          v-for="(submittedValue, submittedValueIndex) in selectedValues"
          :key="submittedValueIndex"
          type="hidden"
          :name="name"
          :value="String(submittedValue)"
        />
      </template>

      <div ref="selectFieldTrigger" v-bind="triggerAttributes" :class="selectFieldSlots.base({ class: ui?.base })">
        <span v-if="triggerAvatar" :class="selectFieldSlots.leadingAvatar({ class: ui?.leadingAvatar })">
          <KAvatar v-bind="triggerAvatar" />
        </span>
        <component
          :is="leadingIcon"
          v-else-if="leadingIcon"
          :class="selectFieldSlots.leadingIcon({ class: ui?.leadingIcon })"
        />

        <input
          v-if="searchesInTrigger"
          ref="selectFieldInput"
          v-bind="comboboxAttributes"
          type="text"
          aria-autocomplete="list"
          autocomplete="off"
          :spellcheck="false"
          :disabled="disabled"
          :value="triggerSearchValue"
          :placeholder="searchFieldPlaceholder"
          :class="selectFieldSlots.input({ class: ui?.input })"
          @input="searchFromTriggerInput"
          @keydown="handleSearchTriggerKeydown"
          @paste="handleSearchTriggerPaste"
        />

        <template v-else>
          <span
            :aria-hidden="announcesSelectedLabelsSeparately || undefined"
            :class="selectFieldSlots.value({ class: ui?.value })"
          >
            <slot v-if="hasSelection" name="selection" :selected-options="selectedSourceOptions">{{ selectionText }}</slot>
            <span v-else-if="placeholder" :class="selectFieldSlots.placeholder({ class: ui?.placeholder })">
              {{ placeholder }}
            </span>
          </span>
          <span
            v-if="announcesSelectedLabelsSeparately"
            :class="selectFieldSlots.selectionForScreenReaders({ class: ui?.selectionForScreenReaders })"
          >
            {{ selectedLabels }}
          </span>
        </template>

        <span
          v-if="showsClearButton || loading || showsTrailingIcon"
          :class="selectFieldSlots.trailing({ class: ui?.trailing })"
        >
          <button
            v-if="showsClearButton"
            type="button"
            :aria-label="clearLabel"
            :class="selectFieldSlots.clearButton({ class: ui?.clearButton })"
            @click.stop="clearSelectionFromButton"
            @keydown.stop
          >
            <X :class="selectFieldSlots.clearIcon({ class: ui?.clearIcon })" />
          </button>
          <KLoadingIndicator
            v-if="loading"
            :label="loadingLabel"
            :class="selectFieldSlots.loadingIndicator({ class: ui?.loadingIndicator })"
          />
          <component
            :is="resolvedTrailingIcon"
            v-else-if="showsTrailingIcon"
            :class="selectFieldSlots.trailingIcon({ class: ui?.trailingIcon })"
          />
        </span>
      </div>

      <span :id="labelId" :class="selectFieldSlots.label({ class: ui?.label })">{{ label }}</span>

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
    </div>

    <p v-if="errorMessage" :id="errorMessageId" :class="selectFieldSlots.errorMessage({ class: ui?.errorMessage })">
      <CircleAlert :class="selectFieldSlots.errorIcon({ class: ui?.errorIcon })" />
      {{ errorMessage }}
    </p>

    <p v-else-if="hint" :id="hintId" :class="selectFieldSlots.hint({ class: ui?.hint })">{{ hint }}</p>
  </div>
</template>
