import { Comment, Fragment, Text, type VNode } from 'vue'

function isBlankText(slotVNode: VNode) {
  return slotVNode.type === Text && !String(slotVNode.children).trim()
}

/** Find the first node a slot really renders, looking into fragments and skipping comments and blank text. */
export function findFirstRenderedVNode(slotVNodes: VNode[]): VNode | undefined {
  for (const slotVNode of slotVNodes) {
    if (slotVNode.type === Comment || isBlankText(slotVNode)) continue

    if (slotVNode.type !== Fragment) return slotVNode

    const fragmentChildren = Array.isArray(slotVNode.children) ? (slotVNode.children as VNode[]) : []
    const firstRenderedChild = findFirstRenderedVNode(fragmentChildren)

    if (firstRenderedChild) return firstRenderedChild
  }

  return undefined
}
