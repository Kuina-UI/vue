import { type Component, computed, type MaybeRefOrGetter, nextTick, type Ref, shallowRef, toValue, useId, watch } from 'vue'
import { createShortcutHandler } from '../../shared/utils/createShortcutHandler'
import { createTypeaheadSearch } from '../../shared/utils/createTypeaheadSearch'
import {
  collectSelectOptions,
  filterSelectEntries,
  type ResolvedSelectOption,
  resolveSelectEntries,
  type SelectOptionEntry,
  type SelectOptionFieldKeys,
} from './selectOptions'

export interface SelectAction {
  label: string
  icon?: Component
  onSelect?: (selectEvent: Event) => void
}

export type SelectHighlightTarget = 'selected' | 'first' | 'last'

type HighlightableSelectItem =
  | { itemId: string; resolvedOption: ResolvedSelectOption }
  | { itemId: string; selectAction: SelectAction }

interface SelectListboxOptions {
  optionEntries: MaybeRefOrGetter<SelectOptionEntry<unknown>[]>
  fieldKeys: MaybeRefOrGetter<SelectOptionFieldKeys>
  actions: MaybeRefOrGetter<SelectAction[]>
  multiple: MaybeRefOrGetter<boolean>
  searchable: MaybeRefOrGetter<boolean>
  searchInTrigger: MaybeRefOrGetter<boolean>
  openable: MaybeRefOrGetter<boolean>
  selectedValue: Ref<unknown>
  isOpen: Ref<boolean>
  focusTrigger: () => void
}

export function createSelectActionId(listboxId: string, actionIndex: number) {
  return `${listboxId}-action-${actionIndex}`
}

function findScrollingAncestor(startElement: HTMLElement) {
  let ancestorElement = startElement.parentElement

  while (ancestorElement && ancestorElement !== document.body) {
    const { overflowY } = getComputedStyle(ancestorElement)
    if (overflowY === 'auto' || overflowY === 'scroll') return ancestorElement
    ancestorElement = ancestorElement.parentElement
  }

  return null
}

/** Scroll the list holding an item just enough to show it, without ever scrolling the page. */
function scrollWithinScrollingAncestor(revealedElement: HTMLElement) {
  const scrollingAncestor = findScrollingAncestor(revealedElement)

  if (!scrollingAncestor) return

  const ancestorBounds = scrollingAncestor.getBoundingClientRect()
  const revealedBounds = revealedElement.getBoundingClientRect()

  if (revealedBounds.top < ancestorBounds.top) {
    scrollingAncestor.scrollTop -= ancestorBounds.top - revealedBounds.top
  } else if (revealedBounds.bottom > ancestorBounds.bottom) {
    scrollingAncestor.scrollTop += revealedBounds.bottom - ancestorBounds.bottom
  }
}

function isPrintableCharacter(keyboardEvent: KeyboardEvent) {
  const usesModifier = keyboardEvent.ctrlKey || keyboardEvent.metaKey || keyboardEvent.altKey
  return [...keyboardEvent.key].length === 1 && keyboardEvent.key !== ' ' && !usesModifier
}

/** Hold what a select shows and does: its options, selection, search, highlighted item and keyboard navigation. */
export function useSelectListbox(listboxOptions: SelectListboxOptions) {
  const { selectedValue, isOpen } = listboxOptions

  const listboxId = useId()
  const searchQuery = shallowRef('')
  const hasStartedTriggerSearch = shallowRef(false)
  const highlightedItemId = shallowRef<string>()
  const findTypeaheadMatch = createTypeaheadSearch()
  let pendingHighlightTarget: SelectHighlightTarget = 'selected'

  const resolvedEntries = computed(() =>
    resolveSelectEntries(toValue(listboxOptions.optionEntries), toValue(listboxOptions.fieldKeys), listboxId),
  )
  const resolvedOptions = computed(() => collectSelectOptions(resolvedEntries.value))

  const visibleEntries = computed(() =>
    toValue(listboxOptions.searchable) ? filterSelectEntries(resolvedEntries.value, searchQuery.value) : resolvedEntries.value,
  )
  const visibleOptions = computed(() => collectSelectOptions(visibleEntries.value))

  const selectedValues = computed<unknown[]>(() => {
    if (toValue(listboxOptions.multiple)) return Array.isArray(selectedValue.value) ? selectedValue.value : []
    return selectedValue.value === undefined || selectedValue.value === null ? [] : [selectedValue.value]
  })

  const selectedOptions = computed(() =>
    resolvedOptions.value.filter((resolvedOption) => selectedValues.value.includes(resolvedOption.value)),
  )

  const highlightableItems = computed<HighlightableSelectItem[]>(() => [
    ...visibleOptions.value
      .filter((visibleOption) => !visibleOption.disabled)
      .map((resolvedOption) => ({ itemId: resolvedOption.optionId, resolvedOption })),
    ...toValue(listboxOptions.actions).map((selectAction, actionIndex) => ({
      itemId: createSelectActionId(listboxId, actionIndex),
      selectAction,
    })),
  ])

  function isOptionSelected(resolvedOption: ResolvedSelectOption) {
    return selectedValues.value.includes(resolvedOption.value)
  }

  function findHighlightTargetId(highlightTarget: SelectHighlightTarget) {
    const highlightableOptionItems = highlightableItems.value.filter((highlightableItem) => 'resolvedOption' in highlightableItem)
    const selectedOptionItem = highlightableOptionItems.find((highlightableItem) =>
      isOptionSelected(highlightableItem.resolvedOption),
    )

    if (highlightTarget === 'selected' && selectedOptionItem) return selectedOptionItem.itemId
    if (highlightTarget === 'last') return highlightableOptionItems.at(-1)?.itemId
    return highlightableOptionItems.at(0)?.itemId
  }

  function revealHighlightedItem() {
    nextTick(() => {
      const highlightedElement = highlightedItemId.value ? document.getElementById(highlightedItemId.value) : null
      if (highlightedElement) scrollWithinScrollingAncestor(highlightedElement)
    })
  }

  function highlightItem(itemId: string | undefined) {
    highlightedItemId.value = itemId
  }

  function highlightItemFromKeyboard(itemId: string | undefined) {
    highlightItem(itemId)
    revealHighlightedItem()
  }

  function moveHighlight(stepDirection: 1 | -1) {
    const itemIds = highlightableItems.value.map((highlightableItem) => highlightableItem.itemId)
    const highlightedIndex = itemIds.indexOf(highlightedItemId.value ?? '')

    if (highlightedIndex === -1) {
      highlightItemFromKeyboard(stepDirection === 1 ? itemIds.at(0) : itemIds.at(-1))
      return
    }

    highlightItemFromKeyboard(itemIds[(highlightedIndex + stepDirection + itemIds.length) % itemIds.length])
  }

  function highlightEdgeItem(edge: 'first' | 'last') {
    const itemIds = highlightableItems.value.map((highlightableItem) => highlightableItem.itemId)
    highlightItemFromKeyboard(edge === 'first' ? itemIds.at(0) : itemIds.at(-1))
  }

  function highlightOptionByTypeahead(typedCharacter: string) {
    const highlightableOptions = visibleOptions.value.filter((visibleOption) => !visibleOption.disabled)
    const highlightedOptionIndex = highlightableOptions.findIndex(
      (highlightableOption) => highlightableOption.optionId === highlightedItemId.value,
    )
    const matchedOptionIndex = findTypeaheadMatch(
      typedCharacter,
      highlightableOptions.map((highlightableOption) => highlightableOption.label),
      highlightedOptionIndex,
    )

    if (matchedOptionIndex !== -1) highlightItemFromKeyboard(highlightableOptions[matchedOptionIndex]?.optionId)
  }

  function openListbox(highlightTarget: SelectHighlightTarget = 'selected') {
    if (!toValue(listboxOptions.openable) || isOpen.value) return

    pendingHighlightTarget = highlightTarget
    isOpen.value = true
  }

  function closeListbox({ restoreFocus }: { restoreFocus: boolean }) {
    isOpen.value = false

    if (restoreFocus) listboxOptions.focusTrigger()
  }

  function toggleListbox() {
    if (isOpen.value) closeListbox({ restoreFocus: false })
    else openListbox()
  }

  function selectOption(resolvedOption: ResolvedSelectOption) {
    if (resolvedOption.disabled) return

    if (!toValue(listboxOptions.multiple)) {
      selectedValue.value = resolvedOption.value
      closeListbox({ restoreFocus: true })
      return
    }

    selectedValue.value = isOptionSelected(resolvedOption)
      ? selectedValues.value.filter((selectedOptionValue) => selectedOptionValue !== resolvedOption.value)
      : [...selectedValues.value, resolvedOption.value]

    if (toValue(listboxOptions.searchInTrigger)) {
      searchQuery.value = ''
      hasStartedTriggerSearch.value = false
    }
  }

  function clearSelection() {
    selectedValue.value = toValue(listboxOptions.multiple) ? [] : undefined
  }

  function runSelectAction(selectAction: SelectAction, selectEvent: Event) {
    selectAction.onSelect?.(selectEvent)
    closeListbox({ restoreFocus: true })
  }

  function activateHighlightedItem(keyboardEvent: KeyboardEvent) {
    const highlightedItem = highlightableItems.value.find(
      (highlightableItem) => highlightableItem.itemId === highlightedItemId.value,
    )

    if (!highlightedItem) return

    if ('resolvedOption' in highlightedItem) selectOption(highlightedItem.resolvedOption)
    else runSelectAction(highlightedItem.selectAction, keyboardEvent)
  }

  const closeListboxAndLetFocusMoveOn = {
    handler: () => closeListbox({ restoreFocus: true }),
    preventDefault: false,
  }

  const handleOpenListboxKeys = createShortcutHandler({
    'arrowdown': () => moveHighlight(1),
    'arrowup': () => moveHighlight(-1),
    'enter': activateHighlightedItem,
    'escape': () => closeListbox({ restoreFocus: true }),
    'tab': closeListboxAndLetFocusMoveOn,
    'shift+tab': closeListboxAndLetFocusMoveOn,
  })

  const handleOpenTriggerKeys = createShortcutHandler({
    home: () => highlightEdgeItem('first'),
    end: () => highlightEdgeItem('last'),
    space: activateHighlightedItem,
  })

  const handleClosedTriggerKeys = createShortcutHandler({
    arrowdown: () => openListbox('selected'),
    arrowup: () => openListbox(selectedValues.value.length ? 'selected' : 'last'),
    enter: () => openListbox('selected'),
    space: () => openListbox('selected'),
  })

  function handleTriggerKeydown(keyboardEvent: KeyboardEvent) {
    if (!isOpen.value) {
      if (!toValue(listboxOptions.openable)) return

      handleClosedTriggerKeys(keyboardEvent)

      if (keyboardEvent.defaultPrevented || !isPrintableCharacter(keyboardEvent)) return

      openListbox('selected')

      if (toValue(listboxOptions.searchable)) searchQuery.value = keyboardEvent.key
      else nextTick(() => highlightOptionByTypeahead(keyboardEvent.key))
      return
    }

    handleOpenListboxKeys(keyboardEvent)
    handleOpenTriggerKeys(keyboardEvent)

    if (!keyboardEvent.defaultPrevented && isPrintableCharacter(keyboardEvent)) highlightOptionByTypeahead(keyboardEvent.key)
  }

  function handleSearchKeydown(keyboardEvent: KeyboardEvent) {
    handleOpenListboxKeys(keyboardEvent)
  }

  const handleClosedSearchTriggerKeys = createShortcutHandler({
    arrowdown: () => openListbox('selected'),
    arrowup: () => openListbox(selectedValues.value.length ? 'selected' : 'last'),
  })

  function searchFromTrigger(typedQuery: string) {
    openListbox('first')
    hasStartedTriggerSearch.value = true
    searchQuery.value = typedQuery
  }

  function findFreshSearchQuery(keyboardEvent: KeyboardEvent) {
    const usesModifier = keyboardEvent.ctrlKey || keyboardEvent.metaKey || keyboardEvent.altKey

    if (isPrintableCharacter(keyboardEvent) || keyboardEvent.key === ' ') return keyboardEvent.key
    if (!usesModifier && (keyboardEvent.key === 'Backspace' || keyboardEvent.key === 'Delete')) return ''
    return undefined
  }

  function handleSearchTriggerKeydown(keyboardEvent: KeyboardEvent) {
    if (!toValue(listboxOptions.openable)) return

    if (isOpen.value) handleOpenListboxKeys(keyboardEvent)
    else handleClosedSearchTriggerKeys(keyboardEvent)

    if (keyboardEvent.defaultPrevented || hasStartedTriggerSearch.value) return

    const freshSearchQuery = findFreshSearchQuery(keyboardEvent)

    if (freshSearchQuery === undefined) return

    keyboardEvent.preventDefault()
    searchFromTrigger(freshSearchQuery)
  }

  function handleSearchTriggerPaste(clipboardEvent: ClipboardEvent) {
    if (hasStartedTriggerSearch.value || !toValue(listboxOptions.openable)) return

    clipboardEvent.preventDefault()
    searchFromTrigger(clipboardEvent.clipboardData?.getData('text') ?? '')
  }

  watch(isOpen, (isListboxOpen) => {
    if (isListboxOpen) {
      highlightItemFromKeyboard(findHighlightTargetId(pendingHighlightTarget))
      pendingHighlightTarget = 'selected'
      return
    }

    searchQuery.value = ''
    hasStartedTriggerSearch.value = false
    highlightedItemId.value = undefined
  })

  watch(searchQuery, () => {
    if (isOpen.value) highlightItemFromKeyboard(findHighlightTargetId('first'))
  })

  watch(
    () => toValue(listboxOptions.openable),
    (isOpenable) => {
      if (!isOpenable && isOpen.value) closeListbox({ restoreFocus: false })
    },
  )

  return {
    listboxId,
    searchQuery,
    hasStartedTriggerSearch,
    highlightedItemId,
    visibleEntries,
    visibleOptions,
    selectedValues,
    selectedOptions,
    isOptionSelected,
    highlightItem,
    openListbox,
    closeListbox,
    toggleListbox,
    selectOption,
    clearSelection,
    runSelectAction,
    handleTriggerKeydown,
    handleSearchKeydown,
    handleSearchTriggerKeydown,
    handleSearchTriggerPaste,
    searchFromTrigger,
  }
}
