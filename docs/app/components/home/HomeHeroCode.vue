<script setup lang="ts">
const codeFence = '```'

const stylesheetCode = `${codeFence}css [main.css]
@import "tailwindcss";
@import "@kuina-ui/vue";
${codeFence}`

const nuxtSetupMarkdown = `::code-group
${stylesheetCode}

${codeFence}ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@kuina-ui/vue/nuxt'],
  css: ['~/assets/css/main.css']
})
${codeFence}

${codeFence}vue [app.vue]
<template>
  <KButton>Save</KButton>
</template>
${codeFence}
::`

const vueSetupMarkdown = `::code-group
${stylesheetCode}

${codeFence}ts [vite.config.ts]
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()]
})
${codeFence}

${codeFence}vue [App.vue]
<script setup lang="ts">
import { KButton } from '@kuina-ui/vue'
</${'script'}>

<template>
  <KButton>Save</KButton>
</template>
${codeFence}
::`
</script>

<template>
  <div class="hidden min-w-0 rounded-xl bg-elevated/50 px-2.5 py-2 lg:block">
    <MDC :value="nuxtSetupMarkdown" class="nuxt-only *:my-0" />
    <MDC :value="vueSetupMarkdown" class="vue-only *:my-0" />
  </div>
</template>
