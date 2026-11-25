<script setup lang="ts">
import { Check, ChevronRight } from 'lucide-vue-next'
import { computed } from 'vue'
import { KButton } from '../../elements/button'
import { formatShortcut } from '../../shared/utils/formatShortcut'
import { isExternalUrl } from '../../shared/utils/isExternalUrl'
import type { MenuItem, MenuItemAction } from './Menu.vue'
import type { menuTheme } from './menu.theme'
import { useMenuContext } from './menuContext'

const props = defineProps<{
  menuItem: MenuItem
  menuThemeSlots: ReturnType<typeof menuTheme>
  submenuKey?: string
  submenuId?: string
  isSubmenuOpen?: boolean
}>()

const emit = defineEmits<{
  select: [selectEvent: MouseEvent]
  selectAction: [menuItemAction: MenuItemAction, selectEvent: MouseEvent]
}>()

const { menuSettings, usesApplePlatform } = useMenuContext()

const menuItemRoles = {
  checkbox: 'menuitemcheckbox',
  radio: 'menuitemradio',
} as const

const ui = computed(() => menuSettings.value.ui)

const hasIndicator = computed(() => props.menuItem.type !== undefined)

const hasSubmenu = computed(() => Boolean(props.menuItem.submenu))

const hasActions = computed(() => Boolean(props.menuItem.actions?.length))

const isDisabled = computed(() => Boolean(props.menuItem.disabled))

const isChecked = computed(() => Boolean(props.menuItem.checked))

const isLink = computed(
  () => Boolean(props.menuItem.href) && !hasIndicator.value && !hasSubmenu.value && !hasActions.value,
)

const opensNewTab = computed(() => isLink.value && isExternalUrl(props.menuItem.href ?? ''))

const displayedShortcut = computed(() =>
  props.menuItem.shortcut ? formatShortcut(props.menuItem.shortcut, usesApplePlatform.value) : undefined,
)

const menuItemAttributes = computed(() => {
  const sharedAttributes = {
    'role': props.menuItem.type ? menuItemRoles[props.menuItem.type] : 'menuitem',
    'tabindex': -1,
    'aria-disabled': isDisabled.value || undefined,
    'data-menu-item-label': props.menuItem.label,
  }

  if (isLink.value) {
    return {
      ...sharedAttributes,
      href: isDisabled.value ? undefined : props.menuItem.href,
      target: opensNewTab.value ? '_blank' : undefined,
      rel: opensNewTab.value ? 'noopener noreferrer' : undefined,
    }
  }

  if (hasSubmenu.value) {
    return {
      ...sharedAttributes,
      'aria-haspopup': 'menu',
      'aria-expanded': String(Boolean(props.isSubmenuOpen)),
      'aria-controls': props.isSubmenuOpen ? props.submenuId : undefined,
      'data-submenu-key': props.submenuKey,
    }
  }

  return { ...sharedAttributes, 'aria-checked': hasIndicator.value ? String(isChecked.value) : undefined }
})
</script>

<template>
  <component
    :is="isLink ? 'a' : 'div'"
    v-bind="menuItemAttributes"
    :class="menuThemeSlots.item({ color: menuItem.color, disabled: isDisabled, hasActions, class: ui?.item })"
    @click="emit('select', $event)"
  >
    <span :class="menuThemeSlots.itemContent({ hasIndicator, class: ui?.itemContent })">
      <span v-if="hasIndicator" aria-hidden="true" :class="menuThemeSlots.indicatorWrapper({ class: ui?.indicatorWrapper })">
        <span :class="menuThemeSlots.indicator({ type: menuItem.type, checked: isChecked, class: ui?.indicator })">
          <template v-if="isChecked">
            <span v-if="menuItem.type === 'radio'" :class="menuThemeSlots.radioDot({ class: ui?.radioDot })" />
            <Check v-else :class="menuThemeSlots.indicatorCheckIcon({ class: ui?.indicatorCheckIcon })" />
          </template>
        </span>
      </span>

      <component :is="menuItem.icon" v-if="menuItem.icon" :class="menuThemeSlots.itemIcon({ class: ui?.itemIcon })" />

      <span :class="menuThemeSlots.itemText({ class: ui?.itemText })">
        <span :class="menuThemeSlots.itemLabel({ class: ui?.itemLabel })">{{ menuItem.label }}</span>
        <span v-if="menuItem.description" :class="menuThemeSlots.itemDescription({ class: ui?.itemDescription })">
          {{ menuItem.description }}
        </span>
      </span>

      <kbd v-if="displayedShortcut" :class="menuThemeSlots.itemShortcut({ class: ui?.itemShortcut })">
        {{ displayedShortcut }}
      </kbd>

      <span v-if="hasActions" :class="menuThemeSlots.itemActions({ class: ui?.itemActions })">
        <KButton
          v-for="(menuItemAction, actionIndex) in menuItem.actions"
          :key="actionIndex"
          :label="menuItemAction.label"
          :leading-icon="menuItemAction.icon"
          variant="ghost"
          color="gray"
          size="xs"
          square
          :pill="false"
          tabindex="-1"
          data-menu-item-action
          @click.stop="emit('selectAction', menuItemAction, $event)"
        />
      </span>

      <ChevronRight v-if="hasSubmenu" :class="menuThemeSlots.submenuIcon({ class: ui?.submenuIcon })" />
    </span>

    <span v-if="opensNewTab" :class="menuThemeSlots.newTabHint({ class: ui?.newTabHint })">(opens in a new tab)</span>
  </component>
</template>
