import { describe, expect, it, vi } from 'vitest'
import type { MenuEntry } from './Menu.vue'
import { collectMenuItems, extractMenuShortcuts } from './menuEntries'

function createTransactionEntries() {
  const editTransaction = vi.fn()
  const moveToHousehold = vi.fn()
  const showPending = vi.fn()
  const deleteTransaction = vi.fn()

  const menuEntries: MenuEntry[] = [
    { label: 'Avery Collins', readOnly: true },
    { label: 'Edit', shortcut: 'mod+e', onSelect: editTransaction },
    { separator: true },
    { label: 'Move to', submenu: [{ label: 'Household', shortcut: 'mod+1', onSelect: moveToHousehold }] },
    { label: 'Show', items: [{ label: 'Pending', type: 'checkbox', shortcut: 'mod+p', onSelect: showPending }] },
    { label: 'Duplicate', shortcut: 'mod+d' },
    { label: 'Delete', shortcut: 'mod+backspace', disabled: true, onSelect: deleteTransaction },
  ]

  return { menuEntries, editTransaction, moveToHousehold, showPending }
}

describe('collectMenuItems', () => {
  it('lists the items, including the ones in groups and submenus, without headings or separators', () => {
    const { menuEntries } = createTransactionEntries()

    expect(collectMenuItems(menuEntries).map((menuItem) => menuItem.label)).toEqual([
      'Edit',
      'Move to',
      'Household',
      'Pending',
      'Duplicate',
      'Delete',
    ])
  })
})

describe('extractMenuShortcuts', () => {
  it('keeps the shortcuts of enabled items that do something when selected', () => {
    const { menuEntries } = createTransactionEntries()

    expect(Object.keys(extractMenuShortcuts(menuEntries))).toEqual(['mod+e', 'mod+1', 'mod+p'])
  })

  it('selects the item when its shortcut runs, passing the keyboard event', () => {
    const { menuEntries, moveToHousehold } = createTransactionEntries()
    const keyboardEvent = new KeyboardEvent('keydown', { key: '1', ctrlKey: true })
    const moveToHouseholdShortcut = extractMenuShortcuts(menuEntries)['mod+1']

    if (typeof moveToHouseholdShortcut === 'function') moveToHouseholdShortcut(keyboardEvent, { shortcut: 'mod+1' })

    expect(moveToHousehold).toHaveBeenCalledWith(keyboardEvent)
  })
})
