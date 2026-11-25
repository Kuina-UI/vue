<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, useId, useTemplateRef, watch } from 'vue'
import { useFloatingPosition } from '../../shared/composables/useFloatingPosition'
import { createShortcutHandler } from '../../shared/utils/createShortcutHandler'
import { createTypeaheadSearch } from '../../shared/utils/createTypeaheadSearch'
import { flipFloatingPosition } from '../../shared/utils/flipFloatingPosition'
import type { MenuEntry, MenuItem, MenuItemAction, MenuProps } from './Menu.vue'
import MenuItemRow from './MenuItemRow.vue'
import { type MenuFocusRequest, type MenuFocusTarget, useMenuContext } from './menuContext'
import { isMenuGroup, isMenuHeader, isMenuItem, isMenuSeparator } from './menuEntries'
import { menuTheme } from './menu.theme'

interface OpenSubmenu {
  submenuKey: string
  menuItem: MenuItem
  focusRequest?: MenuFocusRequest
}

const props = defineProps<{
  panelId: string
  label: string
  entries: MenuEntry[]
  anchorElement: HTMLElement | null | undefined
  side: NonNullable<MenuProps['side']>
  align: NonNullable<MenuProps['align']>
  width: NonNullable<MenuProps['width']>
  sideOffset: number
  alignOffset: number
  focusRequest?: MenuFocusRequest
  isSubmenu?: boolean
}>()

const emit = defineEmits<{
  requestClose: []
  pointerEntered: []
}>()

const submenuCloseDelay = 150

const menuContext = useMenuContext()
const menuPanel = useTemplateRef<HTMLElement>('menuPanel')
const submenuId = useId()
const openSubmenu = shallowRef<OpenSubmenu>()
const findTypeaheadMatch = createTypeaheadSearch()
let submenuCloseTimer: ReturnType<typeof setTimeout> | undefined

const panelPositionModifiers = computed(() => (menuContext.menuSettings.value.flip ? [flipFloatingPosition()] : []))

const { floatingStyles, floatingPlacement, isPositioned } = useFloatingPosition(() => props.anchorElement, menuPanel, {
  open: true,
  side: () => props.side,
  align: () => props.align,
  sideOffset: () => props.sideOffset,
  alignOffset: () => props.alignOffset,
  strategy: () => menuContext.menuSettings.value.strategy,
  positionModifiers: panelPositionModifiers,
})

const menuThemeSlots = computed(() =>
  menuTheme({
    side: floatingPlacement.value.side,
    align: floatingPlacement.value.align,
    width: props.width,
    indicatorPosition: menuContext.menuSettings.value.indicatorPosition,
    indicatorVariant: menuContext.menuSettings.value.indicatorVariant,
  }),
)

const ui = computed(() => menuContext.menuSettings.value.ui)

const submenuItemsByKey = computed(() => {
  const submenuItems = new Map<string, MenuItem>()

  props.entries.forEach((menuEntry, entryIndex) => {
    if (isMenuGroup(menuEntry)) {
      menuEntry.items.forEach((groupItem, groupItemIndex) => {
        if (groupItem.submenu) submenuItems.set(`${entryIndex}.${groupItemIndex}`, groupItem)
      })
    } else if (isMenuItem(menuEntry) && menuEntry.submenu) {
      submenuItems.set(String(entryIndex), menuEntry)
    }
  })

  return submenuItems
})

const submenuAnchorElement = computed(() => {
  if (!openSubmenu.value) return undefined
  return menuPanel.value?.querySelector<HTMLElement>(`[data-submenu-key="${openSubmenu.value.submenuKey}"]`)
})

function findEnabledMenuItems() {
  return Array.from(
    menuPanel.value?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])') ?? [],
  )
}

function findFocusedMenuItem() {
  const focusedElement = document.activeElement

  if (!(focusedElement instanceof HTMLElement) || !menuPanel.value?.contains(focusedElement)) return null

  return focusedElement.closest<HTMLElement>('[role^="menuitem"]')
}

function focusMenuTarget(focusTarget: MenuFocusTarget) {
  const enabledMenuItems = findEnabledMenuItems()
  const focusTargetElements = {
    panel: menuPanel.value,
    firstItem: enabledMenuItems.at(0),
    lastItem: enabledMenuItems.at(-1),
  }
  const focusTargetElement = focusTargetElements[focusTarget] ?? menuPanel.value

  focusTargetElement?.focus({ preventScroll: true })
}

function focusSiblingMenuItem(stepDirection: 1 | -1) {
  const enabledMenuItems = findEnabledMenuItems()
  const focusedItemIndex = enabledMenuItems.findIndex((menuItemElement) => menuItemElement === findFocusedMenuItem())

  if (focusedItemIndex === -1) {
    focusMenuTarget(stepDirection === 1 ? 'firstItem' : 'lastItem')
    return
  }

  const siblingItemIndex = (focusedItemIndex + stepDirection + enabledMenuItems.length) % enabledMenuItems.length
  enabledMenuItems[siblingItemIndex]?.focus()
}

function openSubmenuByKey(submenuKey: string, focusTarget?: MenuFocusTarget) {
  const submenuItem = submenuItemsByKey.value.get(submenuKey)

  if (!submenuItem || submenuItem.disabled) return

  clearTimeout(submenuCloseTimer)

  if (openSubmenu.value?.submenuKey === submenuKey && !focusTarget) return

  openSubmenu.value = { submenuKey, menuItem: submenuItem, focusRequest: focusTarget ? { focusTarget } : undefined }
}

function closeSubmenu({ focusParentItem }: { focusParentItem: boolean }) {
  clearTimeout(submenuCloseTimer)
  const parentMenuItem = submenuAnchorElement.value
  openSubmenu.value = undefined

  if (focusParentItem) parentMenuItem?.focus()
}

function scheduleSubmenuClose() {
  if (!openSubmenu.value) return

  clearTimeout(submenuCloseTimer)
  submenuCloseTimer = setTimeout(() => closeSubmenu({ focusParentItem: false }), submenuCloseDelay)
}

function keepSubmenuOpen() {
  clearTimeout(submenuCloseTimer)
}

function moveIntoFocusedMenuItem() {
  const focusedMenuItem = findFocusedMenuItem()
  const submenuKey = focusedMenuItem?.dataset.submenuKey

  if (!focusedMenuItem) return

  if (submenuKey) {
    openSubmenuByKey(submenuKey, 'firstItem')
    return
  }

  const actionButtons = Array.from(focusedMenuItem.querySelectorAll<HTMLElement>('[data-menu-item-action]'))
  const focusedActionIndex = actionButtons.findIndex((actionButton) => actionButton === document.activeElement)

  actionButtons[focusedActionIndex + 1]?.focus()
}

function moveOutOfFocusedMenuItem() {
  const focusedMenuItem = findFocusedMenuItem()
  const actionButtons = Array.from(focusedMenuItem?.querySelectorAll<HTMLElement>('[data-menu-item-action]') ?? [])
  const focusedActionIndex = actionButtons.findIndex((actionButton) => actionButton === document.activeElement)

  if (focusedActionIndex > 0) {
    actionButtons[focusedActionIndex - 1]?.focus()
  } else if (focusedActionIndex === 0) {
    focusedMenuItem?.focus()
  } else if (props.isSubmenu) {
    emit('requestClose')
  }
}

function activateFocusedElement(keyboardEvent: KeyboardEvent) {
  if (document.activeElement === menuPanel.value) {
    keyboardEvent.preventDefault()
    return
  }

  const focusedMenuItem = findEnabledMenuItems().find((menuItemElement) => menuItemElement === document.activeElement)

  if (!focusedMenuItem) return

  keyboardEvent.preventDefault()

  if (focusedMenuItem.dataset.submenuKey) {
    openSubmenuByKey(focusedMenuItem.dataset.submenuKey, 'firstItem')
  } else {
    focusedMenuItem.click()
  }
}

const closeMenuAndLetFocusMoveOn = {
  handler: () => menuContext.closeMenu({ restoreFocus: true }),
  preventDefault: false,
}

const activateFocusedElementOnKey = {
  handler: activateFocusedElement,
  preventDefault: false,
}

const handlePanelNavigationKeys = createShortcutHandler({
  'arrowdown': () => focusSiblingMenuItem(1),
  'arrowup': () => focusSiblingMenuItem(-1),
  'home': () => focusMenuTarget('firstItem'),
  'end': () => focusMenuTarget('lastItem'),
  'arrowright': moveIntoFocusedMenuItem,
  'arrowleft': moveOutOfFocusedMenuItem,
  'escape': () => (props.isSubmenu ? emit('requestClose') : menuContext.closeMenu({ restoreFocus: true })),
  'tab': closeMenuAndLetFocusMoveOn,
  'shift+tab': closeMenuAndLetFocusMoveOn,
  'enter': activateFocusedElementOnKey,
  'space': activateFocusedElementOnKey,
})

function focusMenuItemByTypeahead(keyboardEvent: KeyboardEvent) {
  const isTypedCharacter = [...keyboardEvent.key].length === 1 && keyboardEvent.key !== ' '
  const usesModifier = keyboardEvent.ctrlKey || keyboardEvent.metaKey || keyboardEvent.altKey

  if (keyboardEvent.defaultPrevented || !isTypedCharacter || usesModifier) return

  const enabledMenuItems = findEnabledMenuItems()
  const focusedItemIndex = enabledMenuItems.findIndex((menuItemElement) => menuItemElement === findFocusedMenuItem())
  const menuItemLabels = enabledMenuItems.map((menuItemElement) => menuItemElement.dataset.menuItemLabel ?? '')
  const matchedItemIndex = findTypeaheadMatch(keyboardEvent.key, menuItemLabels, focusedItemIndex)

  enabledMenuItems[matchedItemIndex]?.focus()
}

function handlePanelKeydown(keyboardEvent: KeyboardEvent) {
  handlePanelNavigationKeys(keyboardEvent)
  focusMenuItemByTypeahead(keyboardEvent)
}

function followPointerOverPanel(pointerEvent: PointerEvent) {
  const pointedMenuItem =
    pointerEvent.target instanceof Element ? pointerEvent.target.closest<HTMLElement>('[role^="menuitem"]') : null
  const isPointedItemEnabled = pointedMenuItem !== null && pointedMenuItem.getAttribute('aria-disabled') !== 'true'
  const pointedSubmenuKey = isPointedItemEnabled ? pointedMenuItem.dataset.submenuKey : undefined

  if (pointedSubmenuKey) {
    openSubmenuByKey(pointedSubmenuKey)
  } else {
    scheduleSubmenuClose()
  }

  if (pointedMenuItem?.contains(document.activeElement)) return

  const highlightedElement = isPointedItemEnabled ? pointedMenuItem : menuPanel.value

  if (highlightedElement && document.activeElement !== highlightedElement) {
    highlightedElement.focus({ preventScroll: true })
  }
}

function clearHighlightOnPointerLeave() {
  if (menuPanel.value?.contains(document.activeElement)) menuPanel.value.focus({ preventScroll: true })
}

function selectMenuItemRow(menuItem: MenuItem, submenuKey: string, selectEvent: MouseEvent) {
  if (menuItem.submenu) {
    openSubmenuByKey(submenuKey, selectEvent.detail === 0 ? 'firstItem' : undefined)
    return
  }

  menuContext.selectMenuItem(menuItem, selectEvent)
}

function selectMenuItemAction(menuItemAction: MenuItemAction, selectEvent: MouseEvent) {
  menuContext.selectMenuItemAction(menuItemAction, selectEvent)
}

watch(
  [isPositioned, () => props.focusRequest],
  ([hasPosition, focusRequest]) => {
    if (hasPosition && focusRequest) focusMenuTarget(focusRequest.focusTarget)
  },
  { flush: 'post' },
)

onBeforeUnmount(() => clearTimeout(submenuCloseTimer))
</script>

<template>
  <div
    :id="panelId"
    ref="menuPanel"
    role="menu"
    :aria-label="label"
    tabindex="-1"
    :style="floatingStyles"
    :class="menuThemeSlots.panel({ class: ui?.panel })"
    @keydown="handlePanelKeydown"
    @pointermove="followPointerOverPanel"
    @pointerleave="clearHighlightOnPointerLeave"
    @pointerenter="emit('pointerEntered')"
  >
    <template v-for="(menuEntry, entryIndex) in entries" :key="entryIndex">
      <div v-if="isMenuSeparator(menuEntry)" role="separator" :class="menuThemeSlots.separator({ class: ui?.separator })" />

      <div v-else-if="isMenuGroup(menuEntry)" role="group" :aria-label="menuEntry.label">
        <div aria-hidden="true" :class="menuThemeSlots.groupLabel({ class: ui?.groupLabel })">
          {{ menuEntry.label }}
        </div>
        <MenuItemRow
          v-for="(groupItem, groupItemIndex) in menuEntry.items"
          :key="groupItemIndex"
          :menu-item="groupItem"
          :menu-theme-slots="menuThemeSlots"
          :submenu-key="`${entryIndex}.${groupItemIndex}`"
          :submenu-id="submenuId"
          :is-submenu-open="openSubmenu?.submenuKey === `${entryIndex}.${groupItemIndex}`"
          @select="selectMenuItemRow(groupItem, `${entryIndex}.${groupItemIndex}`, $event)"
          @select-action="selectMenuItemAction"
        />
      </div>

      <div v-else-if="isMenuHeader(menuEntry)" :class="menuThemeSlots.header({ class: ui?.header })">
        <div :class="menuThemeSlots.headerLabel({ class: ui?.headerLabel })">{{ menuEntry.label }}</div>
        <div v-if="menuEntry.description" :class="menuThemeSlots.headerDescription({ class: ui?.headerDescription })">
          {{ menuEntry.description }}
        </div>
      </div>

      <MenuItemRow
        v-else
        :menu-item="menuEntry"
        :menu-theme-slots="menuThemeSlots"
        :submenu-key="String(entryIndex)"
        :submenu-id="submenuId"
        :is-submenu-open="openSubmenu?.submenuKey === String(entryIndex)"
        @select="selectMenuItemRow(menuEntry, String(entryIndex), $event)"
        @select-action="selectMenuItemAction"
      />
    </template>

    <Teleport v-if="openSubmenu?.menuItem.submenu" :to="menuContext.menuLayer.value">
      <MenuPanel
        :key="openSubmenu.submenuKey"
        :panel-id="submenuId"
        :label="openSubmenu.menuItem.label"
        :entries="openSubmenu.menuItem.submenu"
        :anchor-element="submenuAnchorElement"
        side="right"
        align="start"
        width="auto"
        :side-offset="4"
        :align-offset="-7"
        :focus-request="openSubmenu.focusRequest"
        is-submenu
        @request-close="closeSubmenu({ focusParentItem: true })"
        @pointer-entered="keepSubmenuOpen"
      />
    </Teleport>
  </div>
</template>
