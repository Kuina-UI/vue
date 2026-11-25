<script lang="ts">
import type { Component } from 'vue'
import type { ButtonProps } from '../../elements/button'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { MenuSlotName, MenuThemeVariants } from './menu.theme'

export interface MenuItem {
  label: string
  description?: string
  icon?: Component
  shortcut?: string
  href?: string
  color?: MenuThemeVariants['color']
  type?: MenuThemeVariants['type']
  checked?: boolean
  disabled?: boolean
  onSelect?: (selectEvent: MouseEvent) => void
}

export interface MenuSeparator {
  separator: true
}

export interface MenuGroup {
  label: string
  items: MenuItem[]
}

export interface MenuHeader {
  label: string
  description?: string
  readOnly: true
}

export type MenuEntry = MenuItem | MenuSeparator | MenuGroup | MenuHeader

export type MenuTriggerProps = Pick<
  ButtonProps,
  'variant' | 'color' | 'size' | 'leadingIcon' | 'trailingIcon' | 'pill' | 'square' | 'disabled'
>

export interface MenuProps {
  label: string
  items: MenuEntry[]
  trigger?: MenuTriggerProps
  side?: MenuThemeVariants['side']
  align?: MenuThemeVariants['align']
  width?: MenuThemeVariants['width']
  indicatorPosition?: MenuThemeVariants['indicatorPosition']
  indicatorVariant?: MenuThemeVariants['indicatorVariant']
  ui?: Partial<Record<MenuSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { type ComponentPublicInstance, computed, shallowRef, useId, useTemplateRef, watch } from 'vue'
import { KButton } from '../../elements/button'
import { useDismissOnOutsidePointerDown } from '../../shared/composables/useDismissOnOutsidePointerDown'
import { useFloatingPosition } from '../../shared/composables/useFloatingPosition'
import { createShortcutHandler } from '../../shared/utils/createShortcutHandler'
import MenuItemRow from './MenuItemRow.vue'
import { menuTheme } from './menu.theme'

type MenuFocusTarget = 'panel' | 'firstItem' | 'lastItem'

const props = withDefaults(defineProps<MenuProps>(), {
  side: 'bottom',
  align: 'start',
  width: 'md',
  indicatorPosition: 'end',
  indicatorVariant: 'solid',
})

const isOpen = defineModel<boolean>('open', { default: false })

const menuId = useId()
const triggerButton = useTemplateRef<ComponentPublicInstance>('triggerButton')
const menuPanel = useTemplateRef<HTMLElement>('menuPanel')
const triggerElement = computed<HTMLElement | undefined>(() => triggerButton.value?.$el)
const pendingFocusTarget = shallowRef<MenuFocusTarget>()

const { floatingStyles, floatingPlacement, isPositioned } = useFloatingPosition(triggerElement, menuPanel, {
  open: isOpen,
  side: () => props.side,
  align: () => props.align,
  sideOffset: 6,
})

useDismissOnOutsidePointerDown([triggerElement, menuPanel], {
  active: isOpen,
  onDismiss: () => closeMenu({ restoreFocus: false }),
})

const menuThemeSlots = computed(() =>
  menuTheme({
    side: floatingPlacement.value.side,
    align: floatingPlacement.value.align,
    width: props.width,
    indicatorPosition: props.indicatorPosition,
    indicatorVariant: props.indicatorVariant,
  }),
)

function isMenuSeparator(menuEntry: MenuEntry): menuEntry is MenuSeparator {
  return 'separator' in menuEntry
}

function isMenuGroup(menuEntry: MenuEntry): menuEntry is MenuGroup {
  return 'items' in menuEntry
}

function isMenuHeader(menuEntry: MenuEntry): menuEntry is MenuHeader {
  return 'readOnly' in menuEntry
}

function findEnabledMenuItems() {
  return Array.from(
    menuPanel.value?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])') ?? [],
  )
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
  const focusedItemIndex = enabledMenuItems.findIndex((menuItemElement) => menuItemElement === document.activeElement)

  if (focusedItemIndex === -1) {
    focusMenuTarget(stepDirection === 1 ? 'firstItem' : 'lastItem')
    return
  }

  const siblingItemIndex = (focusedItemIndex + stepDirection + enabledMenuItems.length) % enabledMenuItems.length
  enabledMenuItems[siblingItemIndex]?.focus()
}

function openMenu(focusTarget: MenuFocusTarget) {
  pendingFocusTarget.value = focusTarget
  isOpen.value = true
}

function closeMenu({ restoreFocus }: { restoreFocus: boolean }) {
  pendingFocusTarget.value = undefined
  isOpen.value = false

  if (restoreFocus) triggerElement.value?.focus()
}

function toggleMenuFromTrigger(clickEvent: MouseEvent) {
  if (isOpen.value) {
    closeMenu({ restoreFocus: false })
    return
  }

  openMenu(clickEvent.detail === 0 ? 'firstItem' : 'panel')
}

function selectFocusedMenuItem() {
  findEnabledMenuItems()
    .find((menuItemElement) => menuItemElement === document.activeElement)
    ?.click()
}

const closeMenuAndLetFocusMoveOn = {
  handler: () => closeMenu({ restoreFocus: true }),
  preventDefault: false,
}

const openMenuFromTriggerArrows = createShortcutHandler({
  'arrowdown': () => openMenu('firstItem'),
  'arrowup': () => openMenu('lastItem'),
})

const handleMenuKeydown = createShortcutHandler({
  'arrowdown': () => focusSiblingMenuItem(1),
  'arrowup': () => focusSiblingMenuItem(-1),
  'home': () => focusMenuTarget('firstItem'),
  'end': () => focusMenuTarget('lastItem'),
  'escape': () => closeMenu({ restoreFocus: true }),
  'tab': closeMenuAndLetFocusMoveOn,
  'shift+tab': closeMenuAndLetFocusMoveOn,
  'enter': selectFocusedMenuItem,
  'space': selectFocusedMenuItem,
})

function highlightMenuItemUnderPointer(pointerEvent: PointerEvent) {
  const pointedMenuItem =
    pointerEvent.target instanceof Element ? pointerEvent.target.closest<HTMLElement>('[role^="menuitem"]') : null
  const isPointedItemEnabled = pointedMenuItem?.getAttribute('aria-disabled') !== 'true'
  const highlightedElement = pointedMenuItem && isPointedItemEnabled ? pointedMenuItem : menuPanel.value

  if (highlightedElement && document.activeElement !== highlightedElement) {
    highlightedElement.focus({ preventScroll: true })
  }
}

function clearMenuItemHighlight() {
  menuPanel.value?.focus({ preventScroll: true })
}

function selectMenuItem(menuItem: MenuItem, selectEvent: MouseEvent) {
  if (menuItem.disabled) {
    selectEvent.preventDefault()
    return
  }

  menuItem.onSelect?.(selectEvent)

  if (menuItem.type !== 'checkbox') closeMenu({ restoreFocus: true })
}

watch(
  [isOpen, isPositioned, pendingFocusTarget],
  () => {
    if (!isOpen.value || !isPositioned.value || !pendingFocusTarget.value) return

    focusMenuTarget(pendingFocusTarget.value)
    pendingFocusTarget.value = undefined
  },
  { flush: 'post' },
)
</script>

<template>
  <div :class="menuThemeSlots.root({ class: [ui?.root, props.class] })">
    <KButton
      ref="triggerButton"
      v-bind="trigger"
      :label="label"
      :selected="isOpen"
      :aria-pressed="undefined"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      :aria-controls="isOpen ? menuId : undefined"
      @click="toggleMenuFromTrigger"
      @keydown="openMenuFromTriggerArrows"
    />

    <Teleport to="body">
      <div
        v-if="isOpen"
        :id="menuId"
        ref="menuPanel"
        role="menu"
        :aria-label="label"
        tabindex="-1"
        :style="floatingStyles"
        :class="menuThemeSlots.panel({ class: ui?.panel })"
        @keydown="handleMenuKeydown"
        @pointermove="highlightMenuItemUnderPointer"
        @pointerleave="clearMenuItemHighlight"
      >
        <template v-for="(menuEntry, entryIndex) in items" :key="entryIndex">
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
              :ui="ui"
              @select="selectMenuItem(groupItem, $event)"
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
            :ui="ui"
            @select="selectMenuItem(menuEntry, $event)"
          />
        </template>
      </div>
    </Teleport>
  </div>
</template>
