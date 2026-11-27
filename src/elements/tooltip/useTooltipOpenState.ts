import { computed, type MaybeRefOrGetter, onBeforeUnmount, onMounted, type Ref, shallowRef, toValue, watch } from 'vue'

export type TooltipState = 'closed' | 'delayed-open' | 'instant-open'

interface TooltipOpenStateOptions {
  openDelay: MaybeRefOrGetter<number>
  hasContent: MaybeRefOrGetter<boolean>
  preventUnintentionalClickToClose: MaybeRefOrGetter<boolean>
}

const tooltipOpenEventName = 'kuina:tooltip-open'
const skipOpenDelayDuration = 300
const unintentionalClickDuration = 400

/** Open and close a tooltip with the timing of Radix: a delay on hover, none on focus, one tooltip open at a time. */
export function useTooltipOpenState(isOpen: Ref<boolean>, options: TooltipOpenStateOptions) {
  const tooltipInstanceKey = Symbol('tooltip')
  const wasOpenedAfterDelay = shallowRef(false)
  let isOpenDelayed = true
  let isClickToCloseHeldBack = false
  let openDelayTimer: ReturnType<typeof setTimeout> | undefined
  let skipOpenDelayTimer: ReturnType<typeof setTimeout> | undefined
  let clickToCloseTimer: ReturnType<typeof setTimeout> | undefined

  const tooltipState = computed<TooltipState>(() => {
    if (!isOpen.value) return 'closed'
    return wasOpenedAfterDelay.value ? 'delayed-open' : 'instant-open'
  })

  function holdBackClickToClose(isNowOpen: boolean) {
    clearTimeout(clickToCloseTimer)
    isClickToCloseHeldBack = isNowOpen && toValue(options.preventUnintentionalClickToClose)

    if (isClickToCloseHeldBack) {
      clickToCloseTimer = setTimeout(() => {
        isClickToCloseHeldBack = false
      }, unintentionalClickDuration)
    }
  }

  function updateOpenDelay(isNowOpen: boolean) {
    clearTimeout(skipOpenDelayTimer)

    if (isNowOpen) {
      isOpenDelayed = false
      return
    }

    skipOpenDelayTimer = setTimeout(() => {
      isOpenDelayed = true
    }, skipOpenDelayDuration)
  }

  function changeOpenState(isNowOpen: boolean) {
    if (isNowOpen === isOpen.value) return

    updateOpenDelay(isNowOpen)
    holdBackClickToClose(isNowOpen)

    if (isNowOpen) document.dispatchEvent(new CustomEvent(tooltipOpenEventName, { detail: tooltipInstanceKey }))

    isOpen.value = isNowOpen
  }

  function cancelPendingOpen() {
    clearTimeout(openDelayTimer)
    openDelayTimer = undefined
  }

  function openTooltipNow() {
    cancelPendingOpen()

    if (!toValue(options.hasContent)) return

    wasOpenedAfterDelay.value = false
    changeOpenState(true)
  }

  function openTooltipAfterDelay() {
    cancelPendingOpen()

    if (!toValue(options.hasContent)) return

    openDelayTimer = setTimeout(() => {
      openDelayTimer = undefined
      wasOpenedAfterDelay.value = true
      changeOpenState(true)
    }, toValue(options.openDelay))
  }

  function openTooltipOnPointerEnter() {
    if (isOpenDelayed) openTooltipAfterDelay()
    else openTooltipNow()
  }

  function closeTooltip() {
    cancelPendingOpen()
    changeOpenState(false)
  }

  function closeTooltipOnTriggerPress() {
    if (!isClickToCloseHeldBack) closeTooltip()
  }

  function closeWhenAnotherTooltipOpens(tooltipOpenEvent: Event) {
    if (tooltipOpenEvent instanceof CustomEvent && tooltipOpenEvent.detail !== tooltipInstanceKey) closeTooltip()
  }

  onMounted(() => {
    watch(
      isOpen,
      (isNowOpen, _wasOpen, onCleanup) => {
        if (!isNowOpen) return

        document.addEventListener(tooltipOpenEventName, closeWhenAnotherTooltipOpens)

        onCleanup(() => document.removeEventListener(tooltipOpenEventName, closeWhenAnotherTooltipOpens))
      },
      { immediate: true },
    )
  })

  onBeforeUnmount(() => {
    cancelPendingOpen()
    clearTimeout(skipOpenDelayTimer)
    clearTimeout(clickToCloseTimer)
  })

  return {
    tooltipState,
    openTooltipNow,
    openTooltipOnPointerEnter,
    cancelPendingOpen,
    closeTooltip,
    closeTooltipOnTriggerPress,
  }
}
