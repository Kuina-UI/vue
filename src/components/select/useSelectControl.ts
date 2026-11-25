import { ChevronsUpDown } from 'lucide-vue-next'
import { type Component, computed, type Ref } from 'vue'
import { useDismissOnOutsidePointerDown } from '../../shared/composables/useDismissOnOutsidePointerDown'
import type { SelectOptionEntry } from './selectOptions'
import { type SelectAction, useSelectListbox } from './useSelectListbox'

export interface SelectControlProps<SourceOption> {
  options: SelectOptionEntry<SourceOption>[]
  multiple?: boolean
  valueKey?: string
  labelKey: string
  descriptionKey: string
  avatarKey: string
  searchable?: boolean
  searchPlacement?: 'list' | 'field'
  clearable?: boolean
  loading?: boolean
  disabled?: boolean
  selectionLabel?: (selectedOptions: SourceOption[]) => string
  actions: SelectAction[]
  trailingIcon?: Component | null
}

interface SelectControlElements {
  selectedValue: Ref<unknown>
  isOpen: Ref<boolean>
  rootElement: Readonly<Ref<HTMLElement | null>>
  triggerElement: Readonly<Ref<HTMLElement | null>>
  layerElement: Readonly<Ref<HTMLElement | null>>
  hasSelectionSlot: () => boolean
}

/** Share between the select and the select field what their trigger shows and does, on top of their listbox. */
export function useSelectControl<SourceOption>(
  controlProps: SelectControlProps<SourceOption>,
  controlElements: SelectControlElements,
) {
  const { selectedValue, isOpen, triggerElement } = controlElements

  const isOpenable = computed(() => !controlProps.disabled && !controlProps.loading)

  const searchesInTrigger = computed(() => Boolean(controlProps.searchable) && controlProps.searchPlacement === 'field')

  const navigatesFromTrigger = computed(() => !controlProps.searchable || searchesInTrigger.value)

  const selectListbox = useSelectListbox({
    optionEntries: () => controlProps.options,
    fieldKeys: () => ({
      valueKey: controlProps.valueKey ?? 'value',
      labelKey: controlProps.labelKey,
      descriptionKey: controlProps.descriptionKey,
      avatarKey: controlProps.avatarKey,
    }),
    actions: () => controlProps.actions,
    multiple: () => Boolean(controlProps.multiple),
    searchable: () => Boolean(controlProps.searchable),
    searchInTrigger: searchesInTrigger,
    openable: isOpenable,
    selectedValue,
    isOpen,
    focusTrigger: () => triggerElement.value?.focus(),
  })

  const { selectedOptions } = selectListbox

  const hasSelection = computed(() => selectedOptions.value.length > 0)

  const selectedSourceOptions = computed(() =>
    selectedOptions.value.map((selectedOption) => selectedOption.sourceOption as SourceOption),
  )

  const selectedLabels = computed(() => selectedOptions.value.map((selectedOption) => selectedOption.label).join(', '))

  const selectionText = computed(() =>
    controlProps.selectionLabel ? controlProps.selectionLabel(selectedSourceOptions.value) : selectedLabels.value,
  )

  const announcesSelectedLabelsSeparately = computed(
    () => hasSelection.value && Boolean(controlProps.selectionLabel || controlElements.hasSelectionSlot()),
  )

  const selectedAvatar = computed(() => {
    const [selectedOption] = selectedOptions.value

    if (controlProps.multiple || !selectedOption?.avatar) return undefined

    return {
      ...selectedOption.avatar,
      initials: selectedOption.avatar.initials ?? selectedOption.label.charAt(0).toUpperCase(),
    }
  })

  const resolvedTrailingIcon = computed(() =>
    controlProps.trailingIcon === undefined ? ChevronsUpDown : controlProps.trailingIcon,
  )

  const showsTrailingIcon = computed(() => resolvedTrailingIcon.value !== null && !controlProps.loading)

  const showsClearButton = computed(() => Boolean(controlProps.clearable) && hasSelection.value && isOpenable.value)

  const triggerSearchValue = computed(() => {
    if (selectListbox.hasStartedTriggerSearch.value) return selectListbox.searchQuery.value
    return hasSelection.value ? selectionText.value : ''
  })

  function openTriggerSearchFromClick(clickEvent: MouseEvent, triggerSearchInput: HTMLInputElement | null) {
    if (isOpen.value && clickEvent.target !== triggerSearchInput) {
      selectListbox.closeListbox({ restoreFocus: true })
      return
    }

    triggerSearchInput?.focus()
    selectListbox.openListbox()
  }

  function searchFromTriggerInput(inputEvent: Event) {
    if (inputEvent.target instanceof HTMLInputElement) selectListbox.searchFromTrigger(inputEvent.target.value)
  }

  function clearSelectionFromButton() {
    selectListbox.clearSelection()
    triggerElement.value?.focus()
  }

  useDismissOnOutsidePointerDown([controlElements.rootElement, controlElements.layerElement], {
    active: isOpen,
    onDismiss: () => selectListbox.closeListbox({ restoreFocus: false }),
  })

  return {
    ...selectListbox,
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
  }
}
