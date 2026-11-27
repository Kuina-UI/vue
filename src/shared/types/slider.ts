export interface SliderMark {
  value: number
  label: string
}

export type SliderRange = [start: number, end: number]

export type SliderMarksLayout = 'inline' | 'wrapped' | 'hidden'
