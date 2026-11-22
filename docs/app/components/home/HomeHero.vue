<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

const appConfig = useAppConfig()

const heroLinks: ButtonProps[] = [
  {
    label: 'Get started',
    to: '/getting-started/installation',
    color: 'neutral',
    variant: 'solid',
  },
  {
    label: 'Star on GitHub',
    to: appConfig.github?.url,
    target: '_blank',
    icon: 'i-simple-icons-github',
    color: 'neutral',
    variant: 'soft',
  },
]

const supportedFrameworks = [
  { label: 'Nuxt', icon: 'i-simple-icons-nuxtdotjs' },
  { label: 'Vite', icon: 'i-simple-icons-vite' },
  { label: 'Laravel', icon: 'i-simple-icons-laravel' },
  { label: 'Astro', icon: 'i-simple-icons-astro' },
]

const dotGridCellSize = 28

const twinklingDotCells = [
  [1, 3], [3, 11], [5, 6], [8, 15], [10, 2], [12, 9], [14, 17], [17, 5], [19, 12], [22, 1], [24, 8], [26, 14],
  [29, 4], [31, 10], [34, 16], [36, 7], [38, 2], [41, 13], [43, 6], [46, 18], [48, 3], [50, 11], [53, 8], [56, 15],
]

const twinklingDots = twinklingDotCells.map(([column, row], index) => ({
  left: `${column! * dotGridCellSize + 13.5}px`,
  top: `${row! * dotGridCellSize + 13.5}px`,
  animationDelay: `${(index * 0.9) % 5}s`,
  animationDuration: `${3 + (index % 4) * 0.5}s`,
}))
</script>

<template>
  <UPageHero
    orientation="horizontal"
    description="Accessible, typed components built with Tailwind CSS v4, in light and dark themes. Add them to any Nuxt or Vue app with one install."
    :ui="{
      root: 'overflow-hidden border-b border-default pt-14 sm:pt-22',
      container: 'gap-8 py-0 sm:gap-y-8 sm:py-0 lg:gap-x-9 lg:py-0',
      headline: 'mb-2 sm:mb-4',
      title: 'max-w-xl text-4xl font-medium sm:text-5xl lg:text-6xl',
      description: 'mt-2 max-w-154 text-[15px] sm:mt-4 sm:text-base lg:text-lg',
      footer: 'mt-8',
    }"
  >
    <template #top>
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(var(--ui-border-accented)_1px,transparent_1px)] bg-size-[28px_28px] opacity-50 mask-[linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]"
      />
      <div
        aria-hidden="true"
        class="hero-horizon pointer-events-none absolute inset-x-0 bottom-0 h-45 bg-linear-to-t from-(--hero-horizon-glow) to-transparent"
      />
      <div
        aria-hidden="true"
        class="hero-horizon pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(to_right,transparent,var(--hero-horizon-line)_30%,var(--hero-horizon-line)_70%,transparent)]"
      />
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 mask-[linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]"
      >
        <span
          v-for="(twinklingDot, index) in twinklingDots"
          :key="index"
          class="twinkling-dot absolute size-px rounded-full bg-primary opacity-0"
          :style="twinklingDot"
        />
      </div>
    </template>

    <template #headline>
      <UButton
        label="Free and open source"
        to="/getting-started"
        trailing-icon="i-lucide-arrow-right"
        color="primary"
        variant="soft"
        size="xs"
        class="rounded-full"
      />
    </template>

    <template #title>
      Simple, beautiful<br /><span class="font-semibold text-primary">Vue components</span>
    </template>

    <template #footer>
      <div class="flex flex-wrap gap-3">
        <UButton v-for="heroLink in heroLinks" :key="heroLink.label" size="xl" v-bind="heroLink" />
      </div>

      <div class="mt-6 flex items-center gap-2 text-xs text-muted">
        Works with

        <UTooltip v-for="supportedFramework in supportedFrameworks" :key="supportedFramework.label" :text="supportedFramework.label">
          <ULink
            to="/getting-started/installation"
            :aria-label="supportedFramework.label"
            class="flex opacity-70 transition hover:text-highlighted hover:opacity-100"
          >
            <UIcon :name="supportedFramework.icon" class="size-3.5" />
          </ULink>
        </UTooltip>
      </div>
    </template>

    <HomeHeroCode />

    <template #bottom>
      <div class="h-14 sm:h-22" />
    </template>
  </UPageHero>
</template>

<style scoped>
.hero-horizon {
  --hero-horizon-glow: oklch(from var(--ui-primary) l c h / calc(0.06 + c * 0.45));
  --hero-horizon-line: oklch(from var(--ui-primary) l c h / calc(0.35 + c * 3));
}

.twinkling-dot {
  animation: twinkling-dot-pulse 3s ease-in-out infinite;
}

@keyframes twinkling-dot-pulse {
  0%,
  100% {
    opacity: 0;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .twinkling-dot {
    animation: none;
  }
}
</style>
