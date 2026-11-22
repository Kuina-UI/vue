# Kuina UI — Vue

## Projet

- Librairie de composants Vue 3, publiée sur npm sous `@kuina-ui/vue`, installable dans tout projet Vue : Vite, Nuxt, Laravel, Astro…
- Le repo `Kuina-UI/template` (HTML) est la référence visuelle. Un composant reprend le rendu de sa macro Nunjucks (`src/partials/<nom>.html`) : mêmes classes, mêmes tailles, mêmes états. Les paramètres de la macro deviennent des props. On ne réinvente pas le design.

## Structure

- Un composant = `src/components/<Nom>.vue`, à plat, en PascalCase, sans préfixe. `src/index.ts` exporte tous les composants avec le préfixe `K` (`KButton`).
- `src/index.css` est l'entrée CSS du package : il importe le design system et déclare un `@source` vers les composants, pour que Tailwind voie leurs classes.
- `src/styles/` ne contient que le design system, avec les mêmes règles que le template : tokens dans `theme.css`, une `@utility` par fichier dans `utilities/`, nommé comme la classe, une `@custom-variant` par fichier dans `variants/`, nommé comme la variante. Les tokens restent identiques à ceux du template.
- `src/nuxt.ts` est le module Nuxt, exposé en `@kuina-ui/vue/nuxt` : il ajoute le CSS et enregistre les composants. Les composants eux-mêmes ne dépendent jamais de Nuxt.
- `playgrounds/vue/` (Vite) et `playgrounds/nuxt/` servent à tester chaque composant dans les deux environnements. Ils ne sont pas publiés.
- `dist/` est généré par le build : ne jamais l'éditer.

## Composants

- `<script setup lang="ts">`, props typées.
- Tout est développé dans le projet, sans librairie de composants headless (Reka UI, Radix, Headless UI…) : le comportement interactif (clavier, focus, ARIA) de select, menu, dialog, switch… est écrit ici.
- Compatible SSR : aucun accès à `window` ou `document` en dehors de `onMounted`, IDs générés avec `useId()`.
- Icônes : `lucide-vue-next`.
- `vue` (3.5+) et `tailwindcss` (4+) sont des `peerDependencies`, jamais des dépendances.

## Thèmes

- `data-theme="light"` ou `"dark"` sur `<html>`, posé par le projet qui utilise la librairie. `src/index.css` en déduit `color-scheme`.
- Couleurs de marque et de surface : tokens `--color-*` dans `theme.css`, déclarés avec `light-dark(<clair>, <sombre>)`, dont la classe s'écrit sans variante (`ring-primary`, `bg-canvas` pour le fond de page, `bg-widget` pour les cartes, `border-line` pour les bordures et séparateurs). Toute autre couleur vient de la palette Tailwind et s'écrit en paire `light:…` + `dark:…`, jamais sans variante.

## Langue

Tout est en anglais : code, commentaires, textes, README, fichiers de config. Seule exception : ce fichier CLAUDE.md.

## Nommage

Chaque nom doit être significatif : on doit comprendre à quoi il sert au premier coup d'œil, sans lire le code autour.

S'applique à tout : variables CSS et tokens `@theme`, props, events, variables et fonctions, classes, IDs, noms de fichiers.

- Interdit : noms génériques ou abrégés comme `x`, `data`, `item`, `val`, `tmp`, `el`, `obj`, `info`.
- Un nom précise son rôle et son périmètre. Exemple : `--spacing-page-gutter` (l'espacement autour de la page) plutôt que `--spacing-gutter` (gutter de quoi ?).
- Mieux vaut un nom un peu long et clair qu'un nom court et ambigu.

## Commits

Messages au format Conventional Commits (`feat: …`, `fix: …`, `chore: …`), en anglais, vérifiés par commitlint.

## Commentaires

Pas de commentaire inutile dans le code.

- Seule exception : un doc block (`/** … */`) au-dessus d'un bloc comme une fonction, un composable, une `@utility` ou une `@custom-variant`, pour expliquer ce qui n'est pas évident.
- Court : une ou deux lignes.
- Partout ailleurs, templates Vue et fichiers de config compris : aucun commentaire. Un commentaire qui répète le code est inutile.
