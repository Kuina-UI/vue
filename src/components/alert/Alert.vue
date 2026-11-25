<script lang="ts">
import type { Component } from 'vue'
import type { ClassNameValue } from '../../shared/utils/tv'
import type { AlertSlotName, AlertThemeVariants } from './alert.theme'

export interface AlertProps {
  title?: string
  description?: string
  variant?: AlertThemeVariants['variant']
  color?: AlertThemeVariants['color']
  icon?: Component
  showIcon?: boolean
  actionsPlacement?: AlertThemeVariants['actionsPlacement']
  closable?: boolean
  ui?: Partial<Record<AlertSlotName, ClassNameValue>>
  class?: ClassNameValue
}
</script>

<script setup lang="ts">
import { CircleCheck, Info, TriangleAlert, X } from 'lucide-vue-next'
import { computed, useSlots } from 'vue'
import { KButton } from '../../elements/button'
import { alertTheme } from './alert.theme'

const props = withDefaults(defineProps<AlertProps>(), {
  variant: 'outline',
  color: 'primary',
  showIcon: true,
  actionsPlacement: 'end',
})

const isOpen = defineModel<boolean>('open', { default: true })

const alertSlots = useSlots()

const alertDefaultIcons: Partial<Record<NonNullable<AlertProps['color']>, Component>> = {
  warning: TriangleAlert,
  caution: TriangleAlert,
  danger: TriangleAlert,
  success: CircleCheck,
}

const alertIcon = computed(() => props.icon ?? alertDefaultIcons[props.color] ?? Info)

const hasTitle = computed(() => Boolean(props.title || alertSlots.title))

const hasDescription = computed(() => Boolean(props.description || alertSlots.description))

const hasActions = computed(() => Boolean(alertSlots.actions))

const alertThemeSlots = computed(() =>
  alertTheme({
    variant: props.variant,
    color: props.color,
    actionsPlacement: props.actionsPlacement,
    hasActions: hasActions.value,
    hasTitle: hasTitle.value,
  }),
)
</script>

<template>
  <div
    v-if="isOpen"
    :role="color === 'danger' ? 'alert' : undefined"
    :class="alertThemeSlots.root({ class: [ui?.root, props.class] })"
  >
    <div :class="alertThemeSlots.body({ class: ui?.body })">
      <component :is="alertIcon" v-if="showIcon" :class="alertThemeSlots.icon({ class: ui?.icon })" />
      <div :class="alertThemeSlots.content({ class: ui?.content })">
        <div :class="alertThemeSlots.wrapper({ class: ui?.wrapper })">
          <div v-if="hasTitle" :class="alertThemeSlots.title({ class: ui?.title })">
            <slot name="title">{{ title }}</slot>
          </div>
          <div v-if="hasDescription" :class="alertThemeSlots.description({ class: ui?.description })">
            <slot name="description">{{ description }}</slot>
          </div>
        </div>
        <div v-if="hasActions" :class="alertThemeSlots.actions({ class: ui?.actions })">
          <slot name="actions" />
        </div>
      </div>
      <KButton
        v-if="closable"
        label="Close"
        size="xs"
        variant="ghost"
        color="gray"
        square
        :leading-icon="X"
        :class="alertThemeSlots.closeButton({ class: ui?.closeButton })"
        @click="isOpen = false"
      />
    </div>
  </div>
</template>
