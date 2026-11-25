<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { computed } from 'vue'
import { isExternalUrl } from '../../shared/utils/isExternalUrl'
import type { MenuItem, MenuProps } from './Menu.vue'
import type { menuTheme } from './menu.theme'

const props = defineProps<{
  menuItem: MenuItem
  menuThemeSlots: ReturnType<typeof menuTheme>
  ui?: MenuProps['ui']
}>()

const emit = defineEmits<{
  select: [selectEvent: MouseEvent]
}>()

const menuItemRoles = {
  checkbox: 'menuitemcheckbox',
  radio: 'menuitemradio',
} as const

const hasIndicator = computed(() => props.menuItem.type !== undefined)

const isDisabled = computed(() => Boolean(props.menuItem.disabled))

const isChecked = computed(() => Boolean(props.menuItem.checked))

const isLink = computed(() => Boolean(props.menuItem.href) && !hasIndicator.value)

const opensNewTab = computed(() => isLink.value && isExternalUrl(props.menuItem.href ?? ''))

const menuItemAttributes = computed(() => {
  const sharedAttributes = {
    'role': props.menuItem.type ? menuItemRoles[props.menuItem.type] : 'menuitem',
    'tabindex': -1,
    'aria-disabled': isDisabled.value || undefined,
  }

  if (isLink.value) {
    return {
      ...sharedAttributes,
      href: isDisabled.value ? undefined : props.menuItem.href,
      target: opensNewTab.value ? '_blank' : undefined,
      rel: opensNewTab.value ? 'noopener noreferrer' : undefined,
    }
  }

  return { ...sharedAttributes, 'aria-checked': hasIndicator.value ? String(isChecked.value) : undefined }
})
</script>

<template>
  <component
    :is="isLink ? 'a' : 'div'"
    v-bind="menuItemAttributes"
    :class="menuThemeSlots.item({ color: menuItem.color, disabled: isDisabled, class: ui?.item })"
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

      <kbd v-if="menuItem.shortcut" :class="menuThemeSlots.itemShortcut({ class: ui?.itemShortcut })">
        {{ menuItem.shortcut }}
      </kbd>
    </span>

    <span v-if="opensNewTab" :class="menuThemeSlots.newTabHint({ class: ui?.newTabHint })">(opens in a new tab)</span>
  </component>
</template>
