import { tv, type VariantProps } from '../../shared/utils/tv'

interface TextFieldShapeScale {
  corners: string
  leadingPadding: string
  leadingPaddingWithIcon: string
  trailingPadding: string
  trailingPaddingWithIcon: string
  trailingPaddingWithAction: string
  labelOffset: string
  labelOffsetWithLeadingIcon: string
  leadingIconOffset: string
  trailingIconOffset: string
  trailingActionOffset: string
}

interface TextFieldSizeScale {
  height: string
  fontSize: string
  labelFontSize: string
  floatingLabelFontSize: string
  trailingActionFontSize: string
  iconSize: string
  pillShape: TextFieldShapeScale
  roundedShape: TextFieldShapeScale
}

const textFieldSizeScales = {
  md: {
    height: 'h-8',
    fontSize: 'text-sm',
    labelFontSize: 'text-[11px] peer-placeholder-shown:text-sm peer-focus:text-[11px]',
    floatingLabelFontSize: 'text-[11px]',
    trailingActionFontSize: 'text-sm',
    iconSize: 'size-3',
    pillShape: {
      corners: 'rounded-full',
      leadingPadding: 'pl-4',
      leadingPaddingWithIcon: 'pl-9',
      trailingPadding: 'pr-4',
      trailingPaddingWithIcon: 'pr-9',
      trailingPaddingWithAction: 'pr-12',
      labelOffset: 'left-3',
      labelOffsetWithLeadingIcon: 'left-3 peer-placeholder-shown:left-8 peer-focus:left-3',
      leadingIconOffset: 'left-4',
      trailingIconOffset: 'right-4',
      trailingActionOffset: 'right-3',
    },
    roundedShape: {
      corners: 'rounded-lg',
      leadingPadding: 'pl-3',
      leadingPaddingWithIcon: 'pl-8',
      trailingPadding: 'pr-3',
      trailingPaddingWithIcon: 'pr-8',
      trailingPaddingWithAction: 'pr-11',
      labelOffset: 'left-2',
      labelOffsetWithLeadingIcon: 'left-2 peer-placeholder-shown:left-7 peer-focus:left-2',
      leadingIconOffset: 'left-3',
      trailingIconOffset: 'right-3',
      trailingActionOffset: 'right-2',
    },
  },
  lg: {
    height: 'h-9',
    fontSize: 'text-sm',
    labelFontSize: 'text-[11px] peer-placeholder-shown:text-sm peer-focus:text-[11px]',
    floatingLabelFontSize: 'text-[11px]',
    trailingActionFontSize: 'text-sm',
    iconSize: 'size-3',
    pillShape: {
      corners: 'rounded-full',
      leadingPadding: 'pl-4',
      leadingPaddingWithIcon: 'pl-9',
      trailingPadding: 'pr-4',
      trailingPaddingWithIcon: 'pr-9',
      trailingPaddingWithAction: 'pr-12',
      labelOffset: 'left-3',
      labelOffsetWithLeadingIcon: 'left-3 peer-placeholder-shown:left-8 peer-focus:left-3',
      leadingIconOffset: 'left-4',
      trailingIconOffset: 'right-4',
      trailingActionOffset: 'right-3',
    },
    roundedShape: {
      corners: 'rounded-lg',
      leadingPadding: 'pl-3',
      leadingPaddingWithIcon: 'pl-8',
      trailingPadding: 'pr-3',
      trailingPaddingWithIcon: 'pr-8',
      trailingPaddingWithAction: 'pr-11',
      labelOffset: 'left-2',
      labelOffsetWithLeadingIcon: 'left-2 peer-placeholder-shown:left-7 peer-focus:left-2',
      leadingIconOffset: 'left-3',
      trailingIconOffset: 'right-3',
      trailingActionOffset: 'right-2',
    },
  },
  xl: {
    height: 'h-10',
    fontSize: 'text-base',
    labelFontSize: 'text-[11px] peer-placeholder-shown:text-base peer-focus:text-[11px]',
    floatingLabelFontSize: 'text-[11px]',
    trailingActionFontSize: 'text-sm',
    iconSize: 'size-3.5',
    pillShape: {
      corners: 'rounded-full',
      leadingPadding: 'pl-4.75',
      leadingPaddingWithIcon: 'pl-10.25',
      trailingPadding: 'pr-4.75',
      trailingPaddingWithIcon: 'pr-10.25',
      trailingPaddingWithAction: 'pr-13',
      labelOffset: 'left-3.75',
      labelOffsetWithLeadingIcon: 'left-3.75 peer-placeholder-shown:left-9.25 peer-focus:left-3.75',
      leadingIconOffset: 'left-4.75',
      trailingIconOffset: 'right-4.75',
      trailingActionOffset: 'right-3.75',
    },
    roundedShape: {
      corners: 'rounded-[10px]',
      leadingPadding: 'pl-3.5',
      leadingPaddingWithIcon: 'pl-9',
      trailingPadding: 'pr-3.5',
      trailingPaddingWithIcon: 'pr-9',
      trailingPaddingWithAction: 'pr-12',
      labelOffset: 'left-2.5',
      labelOffsetWithLeadingIcon: 'left-2.5 peer-placeholder-shown:left-8 peer-focus:left-2.5',
      leadingIconOffset: 'left-3.5',
      trailingIconOffset: 'right-3.5',
      trailingActionOffset: 'right-2.5',
    },
  },
  '2xl': {
    height: 'h-11',
    fontSize: 'text-base',
    labelFontSize: 'text-xs peer-placeholder-shown:text-base peer-focus:text-xs',
    floatingLabelFontSize: 'text-xs',
    trailingActionFontSize: 'text-sm',
    iconSize: 'size-4',
    pillShape: {
      corners: 'rounded-full',
      leadingPadding: 'pl-5.25',
      leadingPaddingWithIcon: 'pl-11.25',
      trailingPadding: 'pr-5.25',
      trailingPaddingWithIcon: 'pr-11.25',
      trailingPaddingWithAction: 'pr-14',
      labelOffset: 'left-4.25',
      labelOffsetWithLeadingIcon: 'left-4.25 peer-placeholder-shown:left-10.25 peer-focus:left-4.25',
      leadingIconOffset: 'left-5.25',
      trailingIconOffset: 'right-5.25',
      trailingActionOffset: 'right-4.25',
    },
    roundedShape: {
      corners: 'rounded-xl',
      leadingPadding: 'pl-4',
      leadingPaddingWithIcon: 'pl-10',
      trailingPadding: 'pr-4',
      trailingPaddingWithIcon: 'pr-10',
      trailingPaddingWithAction: 'pr-12',
      labelOffset: 'left-3',
      labelOffsetWithLeadingIcon: 'left-3 peer-placeholder-shown:left-9 peer-focus:left-3',
      leadingIconOffset: 'left-4',
      trailingIconOffset: 'right-4',
      trailingActionOffset: 'right-3',
    },
  },
  '3xl': {
    height: 'h-12',
    fontSize: 'text-base',
    labelFontSize: 'text-xs peer-placeholder-shown:text-base peer-focus:text-xs',
    floatingLabelFontSize: 'text-xs',
    trailingActionFontSize: 'text-sm',
    iconSize: 'size-4',
    pillShape: {
      corners: 'rounded-full',
      leadingPadding: 'pl-5.25',
      leadingPaddingWithIcon: 'pl-11.25',
      trailingPadding: 'pr-5.25',
      trailingPaddingWithIcon: 'pr-11.25',
      trailingPaddingWithAction: 'pr-14',
      labelOffset: 'left-4.25',
      labelOffsetWithLeadingIcon: 'left-4.25 peer-placeholder-shown:left-10.25 peer-focus:left-4.25',
      leadingIconOffset: 'left-5.25',
      trailingIconOffset: 'right-5.25',
      trailingActionOffset: 'right-4.25',
    },
    roundedShape: {
      corners: 'rounded-xl',
      leadingPadding: 'pl-4',
      leadingPaddingWithIcon: 'pl-10',
      trailingPadding: 'pr-4',
      trailingPaddingWithIcon: 'pr-10',
      trailingPaddingWithAction: 'pr-12',
      labelOffset: 'left-3',
      labelOffsetWithLeadingIcon: 'left-3 peer-placeholder-shown:left-9 peer-focus:left-3',
      leadingIconOffset: 'left-4',
      trailingIconOffset: 'right-4',
      trailingActionOffset: 'right-3',
    },
  },
  '4xl': {
    height: 'h-14',
    fontSize: 'text-base',
    labelFontSize: 'text-xs peer-placeholder-shown:text-base peer-focus:text-xs',
    floatingLabelFontSize: 'text-xs',
    trailingActionFontSize: 'text-sm',
    iconSize: 'size-4',
    pillShape: {
      corners: 'rounded-full',
      leadingPadding: 'pl-6',
      leadingPaddingWithIcon: 'pl-12',
      trailingPadding: 'pr-6',
      trailingPaddingWithIcon: 'pr-12',
      trailingPaddingWithAction: 'pr-16',
      labelOffset: 'left-5',
      labelOffsetWithLeadingIcon: 'left-5 peer-placeholder-shown:left-11 peer-focus:left-5',
      leadingIconOffset: 'left-6',
      trailingIconOffset: 'right-6',
      trailingActionOffset: 'right-5',
    },
    roundedShape: {
      corners: 'rounded-2xl',
      leadingPadding: 'pl-4.5',
      leadingPaddingWithIcon: 'pl-10.5',
      trailingPadding: 'pr-4.5',
      trailingPaddingWithIcon: 'pr-10.5',
      trailingPaddingWithAction: 'pr-13',
      labelOffset: 'left-3.5',
      labelOffsetWithLeadingIcon: 'left-3.5 peer-placeholder-shown:left-9.5 peer-focus:left-3.5',
      leadingIconOffset: 'left-4.5',
      trailingIconOffset: 'right-4.5',
      trailingActionOffset: 'right-3.5',
    },
  },
} satisfies Record<string, TextFieldSizeScale>

type TextFieldSizeName = keyof typeof textFieldSizeScales

const textFieldSizeNames = Object.keys(textFieldSizeScales) as TextFieldSizeName[]

function createSizeVariant(sizeScale: TextFieldSizeScale) {
  return {
    base: [sizeScale.height, sizeScale.fontSize],
    leadingIcon: sizeScale.iconSize,
    trailingIcon: sizeScale.iconSize,
    trailingAction: sizeScale.trailingActionFontSize,
  }
}

function createShapeCompounds(sizeName: TextFieldSizeName) {
  const sizeScale = textFieldSizeScales[sizeName]

  return [true, false].flatMap((pill) => {
    const shape = pill ? sizeScale.pillShape : sizeScale.roundedShape

    return [
      {
        size: sizeName,
        pill,
        class: {
          base: shape.corners,
          leadingIcon: shape.leadingIconOffset,
          trailingIconButton: shape.trailingIconOffset,
          trailingAction: shape.trailingActionOffset,
        },
      },
      { size: sizeName, pill, hasLeadingIcon: false, class: { base: shape.leadingPadding, label: shape.labelOffset } },
      { size: sizeName, pill, hasLeadingIcon: true, class: { base: shape.leadingPaddingWithIcon } },
      {
        size: sizeName,
        pill,
        hasLeadingIcon: true,
        floatLabel: 'auto',
        class: { label: shape.labelOffsetWithLeadingIcon },
      },
      { size: sizeName, pill, hasLeadingIcon: true, floatLabel: 'always', class: { label: shape.labelOffset } },
      { size: sizeName, pill, trailingContent: 'none', class: { base: shape.trailingPadding } },
      { size: sizeName, pill, trailingContent: ['icon', 'iconButton'], class: { base: shape.trailingPaddingWithIcon } },
      { size: sizeName, pill, trailingContent: 'icon', class: { trailingIcon: shape.trailingIconOffset } },
      { size: sizeName, pill, trailingContent: 'action', class: { base: shape.trailingPaddingWithAction } },
    ] as const
  })
}

function createFloatLabelCompounds(sizeName: TextFieldSizeName) {
  const sizeScale = textFieldSizeScales[sizeName]

  return [
    { size: sizeName, floatLabel: 'auto', class: { label: sizeScale.labelFontSize } },
    { size: sizeName, floatLabel: 'always', class: { label: sizeScale.floatingLabelFontSize } },
  ] as const
}

const textFieldSizeVariants = Object.fromEntries(
  textFieldSizeNames.map((sizeName) => [sizeName, createSizeVariant(textFieldSizeScales[sizeName])]),
) as Record<TextFieldSizeName, ReturnType<typeof createSizeVariant>>

const textFieldShapeCompounds = textFieldSizeNames.flatMap(createShapeCompounds)

const textFieldFloatLabelCompounds = textFieldSizeNames.flatMap(createFloatLabelCompounds)

export const textFieldTheme = tv({
  slots: {
    root: '',
    container: 'relative',
    base: 'peer w-full border bg-field outline-hidden transition-colors placeholder:text-muted',
    label:
      'pointer-events-none absolute top-0 -translate-y-1/2 bg-linear-to-b from-canvas from-50% to-field to-50% px-1 transition-colors',
    leadingIcon: 'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted',
    trailingIcon: '',
    trailingIconButton:
      'absolute top-1/2 flex -translate-y-1/2 cursor-pointer rounded-full text-muted outline-primary transition-colors hover:text-inherit focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed',
    trailingAction:
      'absolute top-1/2 -translate-y-1/2 cursor-pointer font-medium text-primary disabled:cursor-not-allowed aria-disabled:cursor-not-allowed',
    hint: 'mt-2 text-xs text-muted',
    errorMessage: 'mt-2 flex items-start gap-x-1.5 text-xs light:text-red-600 dark:text-red-400',
    errorIcon: 'mt-px size-3.5 shrink-0',
  },
  variants: {
    variant: {
      outline: '',
      soft: '',
    },
    size: textFieldSizeVariants,
    pill: {
      true: '',
    },
    hasLeadingIcon: {
      true: '',
    },
    floatLabel: {
      auto: {
        label:
          'peer-placeholder-shown:top-1/2 peer-placeholder-shown:transition-all peer-focus:transition-all peer-placeholder-shown:bg-none peer-focus:top-0 peer-focus:bg-linear-to-b',
      },
      always: '',
    },
    trailingContent: {
      none: '',
      icon: { trailingIcon: 'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted' },
      iconButton: '',
      action: '',
    },
    invalid: {
      true: {
        base: 'light:border-red-600 dark:border-red-500 light:selection:bg-red-500/16 dark:selection:bg-red-400/16',
        label: 'light:text-red-600 dark:text-red-400',
      },
    },
    disabled: {
      true: { container: 'opacity-50' },
    },
  },
  compoundVariants: [
    ...textFieldShapeCompounds,
    ...textFieldFloatLabelCompounds,
    {
      invalid: false,
      disabled: false,
      variant: 'outline',
      class: {
        base: 'border-line light:not-focus:hover:border-stone-950/20 dark:not-focus:hover:border-white/20 focus:border-primary',
        label: 'text-muted peer-focus:text-primary',
      },
    },
    {
      invalid: false,
      disabled: false,
      variant: 'soft',
      class: { base: 'border-transparent focus:border-primary', label: 'text-muted peer-focus:text-primary' },
    },
    {
      invalid: false,
      disabled: true,
      variant: 'outline',
      class: { base: 'cursor-not-allowed border-line', label: 'text-muted' },
    },
    {
      invalid: false,
      disabled: true,
      variant: 'soft',
      class: { base: 'cursor-not-allowed border-transparent', label: 'text-muted' },
    },
  ],
})

export type TextFieldThemeVariants = VariantProps<typeof textFieldTheme>

export type TextFieldSlotName = keyof ReturnType<typeof textFieldTheme>
