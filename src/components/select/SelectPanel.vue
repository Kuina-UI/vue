<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import { computed, type InputHTMLAttributes, useTemplateRef, watch } from 'vue'
import { useFloatingPosition } from '../../shared/composables/useFloatingPosition'
import type { FloatingAlign, FloatingSide, FloatingStrategy } from '../../shared/types/floating-position'
import { flipFloatingPosition } from '../../shared/utils/flipFloatingPosition'
import type { ClassNameValue } from '../../shared/utils/tv'
import { type SelectPanelSlotName, selectPanelTheme } from './select-panel.theme'
import SelectOptionRow from './SelectOptionRow.vue'
import { isResolvedSelectGroup, type ResolvedSelectEntry, type ResolvedSelectOption } from './selectOptions'
import { createSelectActionId, type SelectAction } from './useSelectListbox'

const props = defineProps<{
  listboxId: string
  label: string
  visibleEntries: ResolvedSelectEntry[]
  isOptionSelected: (resolvedOption: ResolvedSelectOption) => boolean
  highlightedItemId?: string
  multiple: boolean
  showsSearchInput: boolean
  searchPlaceholder: string
  noResultsLabel: (searchQuery: string) => string
  actions: SelectAction[]
  anchorElement: HTMLElement | null | undefined
  side: FloatingSide
  align: FloatingAlign
  flip: boolean
  strategy: FloatingStrategy
  ui?: Partial<Record<SelectPanelSlotName, ClassNameValue>>
}>()

const emit = defineEmits<{
  selectOption: [resolvedOption: ResolvedSelectOption]
  runSelectAction: [selectAction: SelectAction, selectEvent: MouseEvent]
  highlightItem: [itemId: string]
  searchKeydown: [keyboardEvent: KeyboardEvent]
}>()

const searchQuery = defineModel<string>('searchQuery', { required: true })

const selectPanel = useTemplateRef<HTMLElement>('selectPanel')
const searchContainer = useTemplateRef<HTMLElement>('searchContainer')

const panelPositionModifiers = computed(() => (props.flip ? [flipFloatingPosition()] : []))

const { floatingStyles, isPositioned } = useFloatingPosition(() => props.anchorElement, selectPanel, {
  open: true,
  side: () => props.side,
  align: () => props.align,
  sideOffset: 6,
  strategy: () => props.strategy,
  positionModifiers: panelPositionModifiers,
})

const panelSlots = computed(() => selectPanelTheme())

const searchAttributes = computed<InputHTMLAttributes>(() => ({
  'type': 'search',
  'value': searchQuery.value,
  'placeholder': props.searchPlaceholder,
  'aria-label': props.searchPlaceholder,
  'aria-controls': props.listboxId,
  'aria-autocomplete': 'list',
  'aria-activedescendant': props.highlightedItemId,
  'autocomplete': 'off',
  'spellcheck': false,
  'onInput': (inputEvent: Event) => {
    if (inputEvent.target instanceof HTMLInputElement) searchQuery.value = inputEvent.target.value
  },
  'onKeydown': (keyboardEvent: KeyboardEvent) => emit('searchKeydown', keyboardEvent),
}))

function findActionSlots(actionIndex: number) {
  return selectPanelTheme({ highlighted: createSelectActionId(props.listboxId, actionIndex) === props.highlightedItemId })
}

function highlightAction(actionIndex: number) {
  const actionId = createSelectActionId(props.listboxId, actionIndex)
  if (actionId !== props.highlightedItemId) emit('highlightItem', actionId)
}

function keepFocusOutsideSearch(pointerEvent: PointerEvent) {
  const pointerTarget = pointerEvent.target
  if (pointerTarget instanceof Node && searchContainer.value?.contains(pointerTarget)) return
  pointerEvent.preventDefault()
}

watch(
  isPositioned,
  (hasPosition) => {
    if (hasPosition && props.showsSearchInput) {
      searchContainer.value?.querySelector<HTMLElement>('input, textarea, [contenteditable="true"]')?.focus()
    }
  },
  { flush: 'post' },
)
</script>

<template>
  <div
    ref="selectPanel"
    :style="floatingStyles"
    :class="panelSlots.panel({ class: ui?.panel })"
    @pointerdown="keepFocusOutsideSearch"
  >
    <div v-if="showsSearchInput" ref="searchContainer" :class="panelSlots.search({ class: ui?.search })">
      <slot name="search" :search-attributes="searchAttributes">
        <Search :class="panelSlots.searchIcon({ class: ui?.searchIcon })" />
        <input v-bind="searchAttributes" :class="panelSlots.searchInput({ class: ui?.searchInput })" />
      </slot>
    </div>

    <div :class="panelSlots.optionList({ class: ui?.optionList })">
      <div :id="listboxId" role="listbox" :aria-label="label" :aria-multiselectable="multiple || undefined">
        <template v-for="(visibleEntry, entryIndex) in visibleEntries" :key="entryIndex">
          <div
            v-if="isResolvedSelectGroup(visibleEntry)"
            role="group"
            :aria-label="visibleEntry.groupLabel"
            :class="panelSlots.group({ class: ui?.group })"
          >
            <div aria-hidden="true" :class="panelSlots.groupLabel({ class: ui?.groupLabel })">
              {{ visibleEntry.groupLabel }}
            </div>
            <SelectOptionRow
              v-for="groupOption in visibleEntry.options"
              :key="groupOption.optionId"
              :resolved-option="groupOption"
              :selected="isOptionSelected(groupOption)"
              :highlighted="groupOption.optionId === highlightedItemId"
              :ui="ui"
              @select="emit('selectOption', groupOption)"
              @highlight="emit('highlightItem', groupOption.optionId)"
            >
              <template v-if="$slots.option" #default="optionSlotProps">
                <slot name="option" v-bind="optionSlotProps" />
              </template>
            </SelectOptionRow>
          </div>

          <SelectOptionRow
            v-else
            :resolved-option="visibleEntry"
            :selected="isOptionSelected(visibleEntry)"
            :highlighted="visibleEntry.optionId === highlightedItemId"
            :ui="ui"
            @select="emit('selectOption', visibleEntry)"
            @highlight="emit('highlightItem', visibleEntry.optionId)"
          >
            <template v-if="$slots.option" #default="optionSlotProps">
              <slot name="option" v-bind="optionSlotProps" />
            </template>
          </SelectOptionRow>
        </template>
      </div>

      <div v-if="searchQuery && !visibleEntries.length" :class="panelSlots.noResults({ class: ui?.noResults })">
        {{ noResultsLabel(searchQuery) }}
      </div>
    </div>

    <div v-if="actions.length" :class="panelSlots.actions({ class: ui?.actions })">
      <button
        v-for="(selectAction, actionIndex) in actions"
        :id="createSelectActionId(listboxId, actionIndex)"
        :key="actionIndex"
        type="button"
        tabindex="-1"
        :class="findActionSlots(actionIndex).action({ class: ui?.action })"
        @pointermove="highlightAction(actionIndex)"
        @click="emit('runSelectAction', selectAction, $event)"
      >
        <component :is="selectAction.icon" v-if="selectAction.icon" :class="panelSlots.actionIcon({ class: ui?.actionIcon })" />
        {{ selectAction.label }}
      </button>
    </div>
  </div>
</template>
