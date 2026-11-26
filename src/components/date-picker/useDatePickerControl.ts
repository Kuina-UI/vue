import { Calendar, ChevronsUpDown } from 'lucide-vue-next'
import { type Component, computed, type Ref, useId } from 'vue'
import { type CalendarLabelOptions, useCalendarLabels } from '../../shared/composables/useCalendarLabels'
import { useDatePickerPopover } from './useDatePickerPopover'

interface DatePickerControlProps extends CalendarLabelOptions {
  disabled?: boolean
  leadingIcon?: Component | null
  trailingIcon?: Component | null
}

interface DatePickerControlOptions {
  isOpen: Ref<boolean>
  isInvalid: () => boolean
  rootElement: Readonly<Ref<HTMLElement | null>>
  triggerElement: Readonly<Ref<HTMLElement | null>>
  panelElement: Readonly<Ref<HTMLElement | null>>
  onClose?: () => void
}

/** Share between the date pickers how their calendar opens, what their trigger says to assistive technology, and their texts and icons. */
export function useDatePickerControl(controlProps: DatePickerControlProps, controlOptions: DatePickerControlOptions) {
  const { isOpen } = controlOptions

  const calendarDialogId = useId()
  const isOpenable = computed(() => !controlProps.disabled)

  const calendarLabels = useCalendarLabels(controlProps)

  const calendarPopover = useDatePickerPopover({
    isOpen,
    isOpenable: () => isOpenable.value,
    rootElement: controlOptions.rootElement,
    triggerElement: controlOptions.triggerElement,
    panelElement: controlOptions.panelElement,
    onClose: controlOptions.onClose,
  })

  const dialogTriggerAttributes = computed(() => ({
    'role': 'button',
    'tabindex': controlProps.disabled ? -1 : 0,
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': isOpen.value,
    'aria-controls': isOpen.value ? calendarDialogId : undefined,
    'aria-disabled': controlProps.disabled || undefined,
    'aria-invalid': controlOptions.isInvalid() || undefined,
    'onClick': calendarPopover.toggleCalendar,
    'onKeydown': calendarPopover.openCalendarFromTriggerKeys,
  }))

  const typedInputAttributes = computed(() => ({
    'type': 'text',
    'inputmode': 'numeric' as const,
    'autocomplete': 'off',
    'spellcheck': false,
    'role': 'combobox',
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': isOpen.value,
    'aria-controls': isOpen.value ? calendarDialogId : undefined,
    'aria-invalid': controlOptions.isInvalid() || undefined,
    'disabled': controlProps.disabled,
  }))

  const resolvedLeadingIcon = computed(() => (controlProps.leadingIcon === undefined ? Calendar : controlProps.leadingIcon))
  const resolvedTrailingIcon = computed(() =>
    controlProps.trailingIcon === undefined ? ChevronsUpDown : controlProps.trailingIcon,
  )

  return {
    calendarDialogId,
    isOpenable,
    ...calendarLabels,
    ...calendarPopover,
    dialogTriggerAttributes,
    typedInputAttributes,
    resolvedLeadingIcon,
    resolvedTrailingIcon,
  }
}
