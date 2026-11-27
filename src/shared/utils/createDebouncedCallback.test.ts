import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDebouncedCallback } from './createDebouncedCallback'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('createDebouncedCallback', () => {
  it('runs once with the last arguments after the delay', () => {
    const updateValue = vi.fn()
    const debouncedValueUpdate = createDebouncedCallback(updateValue, 250)

    debouncedValueUpdate.callAfterDelay(1)
    vi.advanceTimersByTime(200)
    debouncedValueUpdate.callAfterDelay(12)
    vi.advanceTimersByTime(249)

    expect(updateValue).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)

    expect(updateValue).toHaveBeenCalledOnce()
    expect(updateValue).toHaveBeenCalledWith(12)
  })

  it('drops the pending call when cancelled', () => {
    const updateValue = vi.fn()
    const debouncedValueUpdate = createDebouncedCallback(updateValue, 250)

    debouncedValueUpdate.callAfterDelay(1)
    debouncedValueUpdate.cancel()
    vi.advanceTimersByTime(500)

    expect(updateValue).not.toHaveBeenCalled()
  })
})
