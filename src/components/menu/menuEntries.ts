import type { ShortcutDefinitions } from '../../shared/types/shortcut'
import type { MenuEntry, MenuGroup, MenuHeader, MenuItem, MenuSeparator } from './Menu.vue'

export function isMenuSeparator(menuEntry: MenuEntry): menuEntry is MenuSeparator {
  return 'separator' in menuEntry
}

export function isMenuGroup(menuEntry: MenuEntry): menuEntry is MenuGroup {
  return 'items' in menuEntry
}

export function isMenuHeader(menuEntry: MenuEntry): menuEntry is MenuHeader {
  return 'readOnly' in menuEntry
}

export function isMenuItem(menuEntry: MenuEntry): menuEntry is MenuItem {
  return !isMenuSeparator(menuEntry) && !isMenuGroup(menuEntry) && !isMenuHeader(menuEntry)
}

/** List every selectable item of a menu, including the ones in groups and submenus. */
export function collectMenuItems(menuEntries: MenuEntry[]): MenuItem[] {
  return menuEntries.flatMap((menuEntry) => {
    if (isMenuGroup(menuEntry)) return collectMenuItems(menuEntry.items)
    if (!isMenuItem(menuEntry)) return []
    return [menuEntry, ...collectMenuItems(menuEntry.submenu ?? [])]
  })
}

/** Turn the shortcuts shown in menu items into shortcuts for useShortcuts, so pressing one selects its item. */
export function extractMenuShortcuts(menuEntries: MenuEntry[]): ShortcutDefinitions {
  const shortcutDefinitions: ShortcutDefinitions = {}

  for (const menuItem of collectMenuItems(menuEntries)) {
    const selectMenuItem = menuItem.onSelect

    if (!menuItem.shortcut || menuItem.disabled || !selectMenuItem) continue

    shortcutDefinitions[menuItem.shortcut] = (keyboardEvent) => selectMenuItem(keyboardEvent)
  }

  return shortcutDefinitions
}
