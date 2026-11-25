import { inject, type InjectionKey, type Ref } from 'vue'
import type { FloatingStrategy } from '../../shared/types/floating-position'
import type { MenuItem, MenuItemAction, MenuProps } from './Menu.vue'

export type MenuFocusTarget = 'panel' | 'firstItem' | 'lastItem'

export interface MenuFocusRequest {
  focusTarget: MenuFocusTarget
}

export interface MenuSettings {
  ui: MenuProps['ui']
  indicatorPosition: NonNullable<MenuProps['indicatorPosition']>
  indicatorVariant: NonNullable<MenuProps['indicatorVariant']>
  strategy: FloatingStrategy
  flip: boolean
}

export interface MenuContext {
  menuSettings: Readonly<Ref<MenuSettings>>
  menuLayer: Readonly<Ref<HTMLElement | null>>
  usesApplePlatform: Readonly<Ref<boolean>>
  closeMenu: (closeOptions: { restoreFocus: boolean }) => void
  selectMenuItem: (menuItem: MenuItem, selectEvent: Event) => void
  selectMenuItemAction: (menuItemAction: MenuItemAction, selectEvent: Event) => void
}

export const menuContextKey: InjectionKey<MenuContext> = Symbol('menuContext')

/** Read what a menu shares with its panels and submenus. */
export function useMenuContext() {
  const menuContext = inject(menuContextKey)

  if (!menuContext) throw new Error('A menu panel must be rendered inside KMenu.')

  return menuContext
}
