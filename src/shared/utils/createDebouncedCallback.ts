/** Delay a callback until no call happened for the given time, keeping only the arguments of the last call. */
export function createDebouncedCallback<CallbackArguments extends unknown[]>(
  callback: (...callbackArguments: CallbackArguments) => void,
  delay: number,
) {
  let pendingCallTimer: ReturnType<typeof setTimeout> | undefined

  function cancel() {
    clearTimeout(pendingCallTimer)
    pendingCallTimer = undefined
  }

  function callAfterDelay(...callbackArguments: CallbackArguments) {
    cancel()
    pendingCallTimer = setTimeout(() => {
      pendingCallTimer = undefined
      callback(...callbackArguments)
    }, delay)
  }

  return { callAfterDelay, cancel }
}
