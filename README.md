<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/public/kuina-logo-dark.svg" />
  <img src="docs/public/kuina-logo-light.svg" alt="Kuina UI logo" height="64" />
</picture>

# Kuina UI — Vue

[![Vue][vue-src]][vue-href]
[![Nuxt][nuxt-src]][nuxt-href]
[![Tailwind CSS][tailwindcss-src]][tailwindcss-href]

Kuina UI is a library of accessible, typed [Vue](https://vuejs.org) components built from scratch with [Tailwind CSS v4](https://tailwindcss.com/), in light and dark themes. It works as a module in [Nuxt](https://nuxt.com) and with plain imports in any Vue app.

> [!NOTE]
> Kuina UI is in early development. The `@kuina-ui/vue` package is not published on npm yet.

## Documentation

The documentation lives in [`docs/`](docs). It needs Node.js 22.22+ or 24.15+:

```bash
cd docs
npm install
npm run dev
```

Then open http://localhost:3000.

## Installation

```bash
npm install @kuina-ui/vue tailwindcss
```

### Nuxt

1. Add the Kuina UI module in your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@kuina-ui/vue/nuxt'],
  css: ['~/assets/css/main.css']
})
```

2. Import Tailwind CSS and Kuina UI in your `app/assets/css/main.css`:

```css
@import "tailwindcss";
@import "@kuina-ui/vue";
```

3. Set the theme on `<html>` in your `app.vue`:

```vue
<script setup lang="ts">
useHead({
  htmlAttrs: { 'data-theme': 'light' }
})
</script>
```

Components are registered for you: write `<KButton>` anywhere, no import needed.

### Vue

1. Install the Tailwind CSS Vite plugin and add it to your `vite.config.ts`:

```bash
npm install @tailwindcss/vite
```

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()]
})
```

2. Import Tailwind CSS and Kuina UI in your `src/assets/main.css`, then load it in `main.ts`:

```css
@import "tailwindcss";
@import "@kuina-ui/vue";
```

```ts
import './assets/main.css'
```

3. Set the theme on `<html>` in your `index.html`:

```html
<html lang="en" data-theme="light">
```

4. Import the components you use:

```vue
<script setup lang="ts">
import { KButton } from '@kuina-ui/vue'
</script>

<template>
  <KButton>Save</KButton>
</template>
```

## Themes

Kuina UI comes in a light and a dark theme. `data-theme` on `<html>` picks it: set it to `light` or `dark`, and every component follows, along with the `light:` and `dark:` variants in your own classes.

## Contribution

Found a bug or have an idea? [Open an issue](https://github.com/Kuina-UI/vue/issues/new).

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat: …`, `fix: …`, `chore: …`), in English.

## Credits

- [vuejs/core](https://github.com/vuejs/core)
- [vitejs/vite](https://github.com/vitejs/vite)
- [nuxt/nuxt](https://github.com/nuxt/nuxt)
- [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss)
- [lucide-icons/lucide](https://github.com/lucide-icons/lucide)
- [nuxt-content/docus](https://github.com/nuxt-content/docus)

## Support Kuina UI

Kuina UI is free and open source. If it saves you time, you can support its development:

- [GitHub Sponsors](https://github.com/sponsors/mgcodeur)
- [Open Collective](https://opencollective.com/mgcodeur)
- [Ko-fi](https://ko-fi.com/mgcodeur)

## License

[MIT](LICENSE): free to use, modify and redistribute, including for commercial projects.

[vue-src]: https://img.shields.io/badge/Vue-18181B?logo=vuedotjs
[vue-href]: https://vuejs.org
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt
[nuxt-href]: https://nuxt.com
[tailwindcss-src]: https://img.shields.io/badge/Tailwind_CSS-18181B?logo=tailwindcss
[tailwindcss-href]: https://tailwindcss.com
