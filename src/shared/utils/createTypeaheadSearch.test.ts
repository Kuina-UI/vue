import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTypeaheadSearch } from './createTypeaheadSearch'

const menuLabels = ['Edit', 'Duplicate', 'Download receipt', 'Delete', 'Share']

afterEach(() => {
  vi.useRealTimers()
})

describe('createTypeaheadSearch', () => {
  it('finds the next label starting with the typed letter, after the current one', () => {
    const findTypeaheadMatch = createTypeaheadSearch()

    expect(findTypeaheadMatch('d', menuLabels, 0)).toBe(1)
  })

  it('starts from the first label when nothing is focused', () => {
    const findTypeaheadMatch = createTypeaheadSearch()

    expect(findTypeaheadMatch('s', menuLabels, -1)).toBe(4)
  })

  it('cycles through labels that start with the same letter when the letter is typed again', () => {
    const findTypeaheadMatch = createTypeaheadSearch()

    expect(findTypeaheadMatch('d', menuLabels, 0)).toBe(1)
    expect(findTypeaheadMatch('d', menuLabels, 1)).toBe(2)
    expect(findTypeaheadMatch('d', menuLabels, 2)).toBe(3)
    expect(findTypeaheadMatch('d', menuLabels, 3)).toBe(1)
  })

  it('narrows the search with letters typed in quick succession', () => {
    const findTypeaheadMatch = createTypeaheadSearch()

    findTypeaheadMatch('d', menuLabels, 0)
    findTypeaheadMatch('e', menuLabels, 1)

    expect(findTypeaheadMatch('l', menuLabels, 3)).toBe(3)
  })

  it('forgets the typed letters after a pause', () => {
    vi.useFakeTimers()
    const findTypeaheadMatch = createTypeaheadSearch(500)

    findTypeaheadMatch('d', menuLabels, 0)
    vi.advanceTimersByTime(501)

    expect(findTypeaheadMatch('e', menuLabels, 1)).toBe(0)
  })

  it('ignores letter case and returns -1 when no label matches', () => {
    const findTypeaheadMatch = createTypeaheadSearch()

    expect(findTypeaheadMatch('E', menuLabels, -1)).toBe(0)
    expect(findTypeaheadMatch('z', ['Edit'], 0)).toBe(-1)
  })
})
