import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, createSSRApp, defineComponent, h, nextTick, ref, shallowRef, type App } from 'vue'
import { renderToString } from 'vue/server-renderer'
import type { ShortcutDefinitions, ShortcutGuard, ShortcutHandler } from '../types/shortcut'
import { useShortcuts } from './useShortcuts'

const mountedApps: App[] = []

function defineShortcutHost(
  shortcutDefinitions: () => ShortcutDefinitions,
  listenerOptions: Parameters<typeof useShortcuts>[1] = {},
) {
  return defineComponent({
    setup() {
      useShortcuts(shortcutDefinitions, listenerOptions)
      return () => h('div')
    },
  })
}

function mountShortcutHost(...hostSetup: Parameters<typeof defineShortcutHost>) {
  const appRoot = document.createElement('div')
  document.body.append(appRoot)
  const app = createApp(defineShortcutHost(...hostSetup))
  app.mount(appRoot)
  mountedApps.push(app)
  return app
}

function pressKey(keyName: string, pressedTarget: EventTarget = document.body) {
  pressedTarget.dispatchEvent(new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true }))
}

function appendEditableField(tagName: 'input' | 'textarea' | 'select') {
  const editableField = document.createElement(tagName)
  document.body.append(editableField)
  return editableField
}

afterEach(() => {
  mountedApps.splice(0).forEach((mountedApp) => mountedApp.unmount())
  document.body.replaceChildren()
})

describe('useShortcuts', () => {
  it('listens on the document once mounted', () => {
    const openHelp = vi.fn()
    mountShortcutHost(() => ({ '?': openHelp }))

    pressKey('?')

    expect(openHelp).toHaveBeenCalledOnce()
  })

  it.each(['input', 'textarea', 'select'] as const)('ignores keys typed in a %s', (tagName) => {
    const openHelp = vi.fn()
    mountShortcutHost(() => ({ '?': openHelp }))

    pressKey('?', appendEditableField(tagName))

    expect(openHelp).not.toHaveBeenCalled()
  })

  it('ignores keys typed in an editable element', () => {
    const openHelp = vi.fn()
    mountShortcutHost(() => ({ '?': openHelp }))
    const editableNote = document.createElement('div')
    editableNote.contentEditable = 'true'
    Object.defineProperty(editableNote, 'isContentEditable', { value: true })
    document.body.append(editableNote)

    pressKey('?', editableNote)

    expect(openHelp).not.toHaveBeenCalled()
  })

  it('runs a shortcut in a field when it allows it', () => {
    const closeSearch = vi.fn()
    mountShortcutHost(() => ({ escape: { handler: closeSearch, allowInEditable: true } }))

    pressKey('Escape', appendEditableField('input'))

    expect(closeSearch).toHaveBeenCalledOnce()
  })

  it('listens only while enabled', async () => {
    const openHelp = vi.fn()
    const isEnabled = ref(false)
    mountShortcutHost(() => ({ '?': openHelp }), { enabled: isEnabled })

    pressKey('?')
    isEnabled.value = true
    await nextTick()
    pressKey('?')

    expect(openHelp).toHaveBeenCalledOnce()
  })

  it('listens on another target when given one', () => {
    const openHelp = vi.fn()
    const shortcutZone = document.createElement('section')
    document.body.append(shortcutZone)
    mountShortcutHost(() => ({ '?': openHelp }), { target: shortcutZone })

    pressKey('?')
    pressKey('?', shortcutZone)

    expect(openHelp).toHaveBeenCalledOnce()
  })

  it('waits for a target that is not rendered yet, instead of listening on the whole page', async () => {
    const openHelp = vi.fn()
    const shortcutZone = shallowRef<HTMLElement | null>(null)
    mountShortcutHost(() => ({ '?': openHelp }), { target: shortcutZone })

    pressKey('?')
    expect(openHelp).not.toHaveBeenCalled()

    shortcutZone.value = document.createElement('section')
    document.body.append(shortcutZone.value)
    await nextTick()
    pressKey('?', shortcutZone.value)

    expect(openHelp).toHaveBeenCalledOnce()
  })

  it('follows shortcuts that change', async () => {
    const openHelp = vi.fn()
    const openSearch = vi.fn()
    const isSearchPage = ref(false)
    mountShortcutHost((): ShortcutDefinitions => (isSearchPage.value ? { '/': openSearch } : { '?': openHelp }))

    isSearchPage.value = true
    await nextTick()
    pressKey('?')
    pressKey('/')

    expect(openHelp).not.toHaveBeenCalled()
    expect(openSearch).toHaveBeenCalledOnce()
  })

  it('applies extra guards after the editable field guard', () => {
    const openHelp = vi.fn()
    const blockEverything: ShortcutGuard = () => false
    mountShortcutHost(() => ({ '?': openHelp }), { guards: [blockEverything] })

    pressKey('?')

    expect(openHelp).not.toHaveBeenCalled()
  })

  it('stops listening once unmounted', () => {
    const openHelp = vi.fn()
    const app = mountShortcutHost(() => ({ '?': openHelp }))

    app.unmount()
    mountedApps.splice(mountedApps.indexOf(app), 1)
    pressKey('?')

    expect(openHelp).not.toHaveBeenCalled()
  })

  it('does not listen during server rendering', async () => {
    const addListener = vi.spyOn(document, 'addEventListener')

    await renderToString(createSSRApp(defineShortcutHost(() => ({ '?': vi.fn<ShortcutHandler>() }))))

    expect(addListener).not.toHaveBeenCalled()
    addListener.mockRestore()
  })
})
