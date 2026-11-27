export interface PointerPosition {
  x: number
  y: number
}

export interface ElementEdges {
  top: number
  right: number
  bottom: number
  left: number
}

export type PointerExitSide = keyof ElementEdges

export type PointerGraceArea = PointerPosition[]
