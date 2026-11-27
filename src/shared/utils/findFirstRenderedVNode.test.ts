import { describe, expect, it } from 'vitest'
import { createCommentVNode, createTextVNode, Fragment, h } from 'vue'
import { findFirstRenderedVNode } from './findFirstRenderedVNode'

describe('findFirstRenderedVNode', () => {
  it('returns the first element of the slot', () => {
    const exportButton = h('button', 'Export')

    expect(findFirstRenderedVNode([exportButton, h('span')])).toBe(exportButton)
  })

  it('skips comments left by v-if and blank text', () => {
    const exportButton = h('button', 'Export')

    expect(findFirstRenderedVNode([createCommentVNode('v-if'), createTextVNode('  '), exportButton])).toBe(exportButton)
  })

  it('looks into fragments', () => {
    const exportButton = h('button', 'Export')

    expect(findFirstRenderedVNode([h(Fragment, [createCommentVNode('v-if'), exportButton])])).toBe(exportButton)
  })

  it('returns plain text', () => {
    const balanceText = createTextVNode('Available balance')

    expect(findFirstRenderedVNode([balanceText])).toBe(balanceText)
  })

  it('returns nothing for an empty slot', () => {
    expect(findFirstRenderedVNode([createCommentVNode('v-if')])).toBeUndefined()
  })
})
