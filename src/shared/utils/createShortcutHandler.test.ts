import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ShortcutGuard, ShortcutHandler } from '../types/shortcut'
import { createShortcutHandler } from './createShortcutHandler'

const platformRestorers: Array<() => void> = []

function usePlatform(platformName: string) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(navigator, 'platform')
  Object.defineProperty(navigator, 'platform', { value: platformName, configurable: true })
  platformRestorers.push(() => {
    if (originalDescriptor) Object.defineProperty(navigator, 'platform', originalDescriptor)
    else Reflect.deleteProperty(navigator, 'platform')
  })
}

function createKeydown(keyboardEventInit: KeyboardEventInit & { altGraph?: boolean }) {
  const { altGraph = false, ...keydownInit } = keyboardEventInit
  const keydownEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...keydownInit })
  keydownEvent.getModifierState = (modifierKey: string) => modifierKey === 'AltGraph' && altGraph
  return keydownEvent
}

afterEach(() => {
  platformRestorers.splice(0).forEach((restorePlatform) => restorePlatform())
  vi.useRealTimers()
})

describe('createShortcutHandler', () => {
  describe('running a shortcut', () => {
    it('runs the handler with the event and the matched shortcut', () => {
      const closePanel = vi.fn()
      const handleKeydown = createShortcutHandler({ escape: closePanel })
      const escapeKeydown = createKeydown({ key: 'Escape' })

      handleKeydown(escapeKeydown)

      expect(closePanel).toHaveBeenCalledWith(escapeKeydown, { shortcut: 'escape' })
    })

    it('prevents the default action unless the shortcut opts out', () => {
      const handleKeydown = createShortcutHandler({
        enter: vi.fn<ShortcutHandler>(),
        tab: { handler: vi.fn<ShortcutHandler>(), preventDefault: false },
      })
      const enterKeydown = createKeydown({ key: 'Enter' })
      const tabKeydown = createKeydown({ key: 'Tab' })

      handleKeydown(enterKeydown)
      handleKeydown(tabKeydown)

      expect(enterKeydown.defaultPrevented).toBe(true)
      expect(tabKeydown.defaultPrevented).toBe(false)
    })

    it('ignores other keys and events that are not keyboard events', () => {
      const closePanel = vi.fn()
      const handleKeydown = createShortcutHandler({ escape: closePanel })

      handleKeydown(createKeydown({ key: 'Enter' }))
      handleKeydown(new Event('keydown'))

      expect(closePanel).not.toHaveBeenCalled()
    })

    it('ignores keys pressed while composing text, like an accent or an Asian character', () => {
      const searchTransactions = vi.fn()
      const handleKeydown = createShortcutHandler({ k: searchTransactions })

      handleKeydown(createKeydown({ key: 'k', isComposing: true }))

      expect(searchTransactions).not.toHaveBeenCalled()
    })
  })

  describe('modifiers', () => {
    it('uses Ctrl for mod outside Apple platforms', () => {
      usePlatform('Win32')
      const openSearch = vi.fn()
      const handleKeydown = createShortcutHandler({ 'mod+k': openSearch })

      handleKeydown(createKeydown({ key: 'k', metaKey: true }))
      handleKeydown(createKeydown({ key: 'k', ctrlKey: true }))

      expect(openSearch).toHaveBeenCalledOnce()
    })

    it('uses Command for mod on Apple platforms', () => {
      usePlatform('MacIntel')
      const openSearch = vi.fn()
      const handleKeydown = createShortcutHandler({ 'mod+k': openSearch })

      handleKeydown(createKeydown({ key: 'k', ctrlKey: true }))
      handleKeydown(createKeydown({ key: 'k', metaKey: true }))

      expect(openSearch).toHaveBeenCalledOnce()
    })

    it('requires the exact modifiers', () => {
      usePlatform('Win32')
      const openSearch = vi.fn()
      const typeLetter = vi.fn()
      const handleKeydown = createShortcutHandler({ 'mod+k': openSearch, 'k': typeLetter })

      handleKeydown(createKeydown({ key: 'K', ctrlKey: true, shiftKey: true }))
      handleKeydown(createKeydown({ key: 'k', ctrlKey: true, altKey: true }))

      expect(openSearch).not.toHaveBeenCalled()
      expect(typeLetter).not.toHaveBeenCalled()
    })

    it('tells letters typed with and without Shift apart', () => {
      const moveForward = vi.fn()
      const moveBackward = vi.fn()
      const handleKeydown = createShortcutHandler({ 'tab': moveForward, 'shift+tab': moveBackward, 'shift+k': vi.fn<ShortcutHandler>() })

      handleKeydown(createKeydown({ key: 'Tab', shiftKey: true }))

      expect(moveBackward).toHaveBeenCalledOnce()
      expect(moveForward).not.toHaveBeenCalled()
    })

    it('matches a symbol whatever Shift is needed to type it', () => {
      const openHelp = vi.fn()
      const handleKeydown = createShortcutHandler({ '?': openHelp })

      handleKeydown(createKeydown({ key: '?', shiftKey: true }))

      expect(openHelp).toHaveBeenCalledOnce()
    })
  })

  describe('keyboard layouts', () => {
    it('matches the character typed on an AZERTY keyboard, not the physical key', () => {
      usePlatform('Win32')
      const selectAll = vi.fn()
      const handleKeydown = createShortcutHandler({ 'mod+a': selectAll })

      handleKeydown(createKeydown({ key: 'a', code: 'KeyQ', ctrlKey: true }))

      expect(selectAll).toHaveBeenCalledOnce()
    })

    it('matches a digit typed with Shift on an AZERTY keyboard', () => {
      const openFirstTab = vi.fn()
      const handleKeydown = createShortcutHandler({ 1: openFirstTab })

      handleKeydown(createKeydown({ key: '1', code: 'Digit1', shiftKey: true }))

      expect(openFirstTab).toHaveBeenCalledOnce()
    })

    it('matches a symbol typed with AltGr, which browsers report as Ctrl and Alt', () => {
      const mentionSomeone = vi.fn()
      const handleKeydown = createShortcutHandler({ '@': mentionSomeone })

      handleKeydown(createKeydown({ key: '@', ctrlKey: true, altKey: true, altGraph: true }))

      expect(mentionSomeone).toHaveBeenCalledOnce()
    })

    it('falls back to the physical key when Alt turns the letter into a symbol on macOS', () => {
      const toggleSidebar = vi.fn()
      const handleKeydown = createShortcutHandler({ 'alt+k': toggleSidebar })

      handleKeydown(createKeydown({ key: '˚', code: 'KeyK', altKey: true }))

      expect(toggleSidebar).toHaveBeenCalledOnce()
    })
  })

  describe('sequences', () => {
    it('runs a sequence pressed key after key', () => {
      const goToDashboard = vi.fn()
      const handleKeydown = createShortcutHandler({ 'g d': goToDashboard })

      handleKeydown(createKeydown({ key: 'g' }))
      expect(goToDashboard).not.toHaveBeenCalled()

      handleKeydown(createKeydown({ key: 'd' }))
      expect(goToDashboard).toHaveBeenCalledOnce()
    })

    it('starts over when another key breaks the sequence, and when its first key is pressed again', () => {
      const goToDashboard = vi.fn()
      const handleKeydown = createShortcutHandler({ 'g d': goToDashboard })

      handleKeydown(createKeydown({ key: 'g' }))
      handleKeydown(createKeydown({ key: 'x' }))
      handleKeydown(createKeydown({ key: 'd' }))
      expect(goToDashboard).not.toHaveBeenCalled()

      handleKeydown(createKeydown({ key: 'g' }))
      handleKeydown(createKeydown({ key: 'g' }))
      handleKeydown(createKeydown({ key: 'd' }))
      expect(goToDashboard).toHaveBeenCalledOnce()
    })

    it('keeps the sequence when a modifier key is pressed alone in between', () => {
      const goToDashboard = vi.fn()
      const handleKeydown = createShortcutHandler({ 'g shift+d': goToDashboard })

      handleKeydown(createKeydown({ key: 'g' }))
      handleKeydown(createKeydown({ key: 'Shift', shiftKey: true }))
      handleKeydown(createKeydown({ key: 'D', shiftKey: true }))

      expect(goToDashboard).toHaveBeenCalledOnce()
    })

    it('forgets a sequence left unfinished for longer than the timeout', () => {
      vi.useFakeTimers()
      const goToDashboard = vi.fn()
      const handleKeydown = createShortcutHandler({ 'g d': goToDashboard }, { sequenceTimeout: 500 })

      handleKeydown(createKeydown({ key: 'g' }))
      vi.advanceTimersByTime(501)
      handleKeydown(createKeydown({ key: 'd' }))

      expect(goToDashboard).not.toHaveBeenCalled()
    })

    it('keeps the progress of each handler to itself', () => {
      const goToDashboard = vi.fn()
      const firstPageKeydown = createShortcutHandler({ 'g d': goToDashboard })
      const secondPageKeydown = createShortcutHandler({ 'g d': goToDashboard })

      firstPageKeydown(createKeydown({ key: 'g' }))
      secondPageKeydown(createKeydown({ key: 'd' }))

      expect(goToDashboard).not.toHaveBeenCalled()
    })
  })

  describe('guards', () => {
    it('runs a shortcut only when every guard allows it, and gives each guard the shortcut', () => {
      const openSearch = vi.fn()
      const allowOnlyEscape = vi.fn<ShortcutGuard>((_keyboardEvent, shortcutBinding) => shortcutBinding.shortcut === 'escape')
      const handleKeydown = createShortcutHandler(
        { '/': openSearch, 'escape': vi.fn<ShortcutHandler>() },
        { guards: [allowOnlyEscape] },
      )

      handleKeydown(createKeydown({ key: '/' }))

      expect(openSearch).not.toHaveBeenCalled()
      expect(allowOnlyEscape).toHaveBeenCalledWith(expect.any(KeyboardEvent), expect.objectContaining({ shortcut: '/' }))
    })
  })
})
