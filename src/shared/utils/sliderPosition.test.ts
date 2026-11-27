import { describe, expect, it } from 'vitest'
import {
  convertPointerToValue,
  convertValueToPercent,
  convertValueToRatio,
  hasCrowdedMarks,
  sortSliderMarks,
} from './sliderPosition'

describe('convertValueToRatio', () => {
  it('places min at 0 and max at 1', () => {
    expect(convertValueToRatio(0, 0, 2000)).toBe(0)
    expect(convertValueToRatio(500, 0, 2000)).toBe(0.25)
    expect(convertValueToRatio(2000, 0, 2000)).toBe(1)
  })

  it('returns 0 for an empty range', () => {
    expect(convertValueToRatio(3, 3, 3)).toBe(0)
  })
})

describe('convertValueToPercent', () => {
  it('converts the value to a percentage of the range', () => {
    expect(convertValueToPercent(1250, 0, 2000)).toBe(62.5)
    expect(convertValueToPercent(3, 1, 5)).toBe(50)
  })

  it('keeps values outside the range at the ends of the track', () => {
    expect(convertValueToPercent(-10, 0, 100)).toBe(0)
    expect(convertValueToPercent(150, 0, 100)).toBe(100)
  })
})

describe('convertPointerToValue', () => {
  it('scales the pointer offset to the range', () => {
    expect(convertPointerToValue(0, 300, 0, 2000)).toBe(0)
    expect(convertPointerToValue(150, 300, 0, 2000)).toBe(1000)
    expect(convertPointerToValue(300, 300, 0, 2000)).toBe(2000)
    expect(convertPointerToValue(75, 300, 1, 5)).toBe(2)
  })

  it('goes past the range when the pointer leaves the track', () => {
    expect(convertPointerToValue(-30, 300, 0, 100)).toBe(-10)
  })

  it('returns min for a track without width', () => {
    expect(convertPointerToValue(20, 0, 5, 10)).toBe(5)
  })
})

describe('sortSliderMarks', () => {
  it('sorts the marks by value', () => {
    const sortedMarks = sortSliderMarks(
      [
        { value: 3, label: 'Accurate' },
        { value: 1, label: 'Inaccurate' },
        { value: 2, label: 'Some inaccuracies' },
      ],
      1,
      3,
    )

    expect(sortedMarks.map((sliderMark) => sliderMark.value)).toEqual([1, 2, 3])
  })

  it('refuses a mark outside the range', () => {
    expect(() => sortSliderMarks([{ value: 6, label: '6' }], 1, 5)).toThrow('Slider mark value 6 is out of bounds [1, 5]')
  })

  it('refuses two marks with the same value', () => {
    expect(() =>
      sortSliderMarks(
        [
          { value: 2, label: 'Two' },
          { value: 2, label: 'Second two' },
        ],
        1,
        5,
      ),
    ).toThrow('Slider marks must have unique values')
  })
})

describe('hasCrowdedMarks', () => {
  it('finds labels closer than the minimum spacing', () => {
    expect(
      hasCrowdedMarks(
        [
          { left: 0, right: 60 },
          { left: 70, right: 120 },
        ],
        16,
      ),
    ).toBe(true)
  })

  it('accepts labels at least the minimum spacing apart', () => {
    expect(
      hasCrowdedMarks(
        [
          { left: 0, right: 60 },
          { left: 76, right: 120 },
          { left: 200, right: 240 },
        ],
        16,
      ),
    ).toBe(false)
  })
})
