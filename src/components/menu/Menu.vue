<script lang="ts">
import type { Component } from 'vue'
import type { ButtonProps } from '../../elements/button'
import type { FloatingStrategy } from '../../shared/types/floating-position'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { MenuSlotName, MenuThemeVariants } from './menu.theme'

export interface MenuItemAction {
  label: string
  icon: Component
  onSelect?: (selectEvent: Event) => void
}

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
  actions?: MenuItemAction[]
  submenu?: MenuEntry[]
  onSelect?: (selectEvent: Event) => void
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
  strategy?: FloatingStrategy
  flip?: boolean
  ui?: Partial<Record<MenuSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { computed, provide, shallowRef, useId, useTemplateRef } from 'vue'
import { KButton } from '../../elements/button'
import { useApplePlatform } from '../../shared/composables/useApplePlatform'
import { useDismissOnOutsidePointerDown } from '../../shared/composables/useDismissOnOutsidePointerDown'
import { createShortcutHandler } from '../../shared/utils/createShortcutHandler'
import MenuPanel from './MenuPanel.vue'
import { type MenuFocusRequest, type MenuFocusTarget, menuContextKey } from './menuContext'
import { menuTheme } from './menu.theme'

const props = withDefaults(defineProps<MenuProps>(), {
  side: 'bottom',
  align: 'start',
  width: 'md',
  indicatorPosition: 'end',
  indicatorVariant: 'solid',
  strategy: 'absolute',
  flip: true,
})

const isOpen = defineModel<boolean>('open', { default: false })

const menuId = useId()
const menuRoot = useTemplateRef<HTMLElement>('menuRoot')
const menuLayer = useTemplateRef<HTMLElement>('menuLayer')
const rootFocusRequest = shallowRef<MenuFocusRequest>()
const usesApplePlatform = useApplePlatform()

const menuSettings = computed(() => ({
  ui: props.ui,
  indicatorPosition: props.indicatorPosition,
  indicatorVariant: props.indicatorVariant,
  strategy: props.strategy,
  flip: props.flip,
}))

const menuRootClass = computed(() => menuTheme().root({ class: [props.ui?.root, props.class] }))

function findTriggerFocusTarget() {
  return menuRoot.value?.querySelector<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')
}

function openMenu(focusTarget: MenuFocusTarget) {
  rootFocusRequest.value = { focusTarget }
  isOpen.value = true
}

function closeMenu({ restoreFocus }: { restoreFocus: boolean }) {
  isOpen.value = false

  if (restoreFocus) findTriggerFocusTarget()?.focus()
}

function toggleMenuFromTrigger(clickEvent: MouseEvent) {
  if (isOpen.value) {
    closeMenu({ restoreFocus: false })
    return
  }

  openMenu(clickEvent.detail === 0 ? 'firstItem' : 'panel')
}

const openMenuFromTriggerArrows = createShortcutHandler({
  arrowdown: () => openMenu('firstItem'),
  arrowup: () => openMenu('lastItem'),
})

function selectMenuItem(menuItem: MenuItem, selectEvent: Event) {
  if (menuItem.disabled) {
    selectEvent.preventDefault()
    return
  }

  menuItem.onSelect?.(selectEvent)

  if (menuItem.type !== 'checkbox') closeMenu({ restoreFocus: true })
}

function selectMenuItemAction(menuItemAction: MenuItemAction, selectEvent: Event) {
  menuItemAction.onSelect?.(selectEvent)
  closeMenu({ restoreFocus: true })
}

const triggerSlotProps = computed(() => ({
  open: isOpen.value,
  triggerAttributes: {
    'aria-haspopup': 'menu' as const,
    'aria-expanded': isOpen.value,
    'aria-controls': isOpen.value ? menuId : undefined,
    'onClick': toggleMenuFromTrigger,
    'onKeydown': openMenuFromTriggerArrows,
  },
}))

provide(menuContextKey, {
  menuSettings,
  menuLayer,
  usesApplePlatform,
  closeMenu,
  selectMenuItem,
  selectMenuItemAction,
})

useDismissOnOutsidePointerDown([menuRoot, menuLayer], {
  active: isOpen,
  onDismiss: () => closeMenu({ restoreFocus: false }),
})
</script>

<template>
  <div ref="menuRoot" :class="menuRootClass">
    <slot name="trigger" v-bind="triggerSlotProps">
      <KButton
        v-bind="{ ...trigger, ...triggerSlotProps.triggerAttributes }"
        :label="label"
        :selected="isOpen"
        :aria-pressed="undefined"
      />
    </slot>

    <Teleport to="body">
      <div v-if="isOpen" ref="menuLayer">
        <MenuPanel
          :panel-id="menuId"
          :label="label"
          :entries="items"
          :anchor-element="menuRoot"
          :side="side"
          :align="align"
          :width="width"
          :side-offset="6"
          :align-offset="0"
          :focus-request="rootFocusRequest"
        />
      </div>
    </Teleport>
  </div>
</template>
