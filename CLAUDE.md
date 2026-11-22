# Kuina UI — Vue

## Projet

- Librairie de composants Vue 3, publiée sur npm sous `@kuina-ui/vue`, installable dans tout projet Vue : Vite, Nuxt, Laravel, Astro…
- Le repo `Kuina-UI/template` (HTML) est la référence visuelle. Un composant reprend le rendu de sa macro Nunjucks (`src/partials/<nom>.html`) : mêmes classes, mêmes tailles, mêmes états. Les paramètres de la macro deviennent des props. On ne réinvente pas le design.

## Structure

Architecture inspirée de FSD : couches, slices, API publique.

- `src/shared/` : socle sans composant.
  - `styles/` : le design system, avec les mêmes règles que le template : tokens dans `theme.css`, une `@utility` par fichier dans `utilities/`, nommé comme la classe, une `@custom-variant` par fichier dans `variants/`, nommé comme la variante. Les tokens restent identiques à ceux du template.
  - `composables/` : comportements réutilisés par plusieurs composants.
  - `utils/` : `tv()` configuré avec les tokens Kuina.
  - `types/` : types communs (`Size`, `Color`…).
- `src/elements/` : composants simples, sans autre composant Kuina dedans (Button, Badge, Avatar…).
- `src/components/` : composants faits d'éléments (TextField, Select, Menu, Dialog…).
- `src/blocks/` : plus tard, les grands ensembles (Sidebar, Header…).
- Un slice = un dossier en kebab-case par composant (`elements/button/`) : `Button.vue`, `button.theme.ts`, ses composables privés et `index.ts`. `index.ts` est son API publique : il exporte le composant préfixé `K` (`KButton`) et ses types.
- Les imports ne vont que vers le bas : `blocks` → `components` → `elements` → `shared`. Jamais d'import entre deux slices d'une même couche : si l'un a besoin de l'autre, celui-ci descend d'une couche.
- On importe un slice uniquement par son `index.ts`.
- `src/index.ts` réexporte l'API publique de chaque slice. `src/index.css` est l'entrée CSS (design system + `@source`). `src/nuxt.ts` est le module Nuxt, exposé en `@kuina-ui/vue/nuxt` : il ajoute le CSS et enregistre les composants. Les composants ne dépendent jamais de Nuxt.
- `docs/` : la documentation (Docus), qui sert aussi de test Nuxt. C'est un repo séparé (`Kuina-UI/docs`), rangé ici pour le manipuler facilement et ignoré par git dans ce repo. `playgrounds/vue/` (Vite, ignoré par git) teste hors Nuxt, en important directement le code de `src/`. Ni l'un ni l'autre n'est publié.
- `dist/` est généré par le build : ne jamais l'éditer.

## Composants

- `<script setup lang="ts">`, props typées.
- Tout est développé dans le projet, sans librairie de composants headless (Reka UI, Radix, Headless UI…) : le comportement interactif (clavier, focus, ARIA) de select, menu, dialog, switch… est écrit ici.
- Compatible SSR : aucun accès à `window` ou `document` en dehors de `onMounted`, IDs générés avec `useId()`.
- Icônes : `lucide-vue-next`.
- `vue` (3.5+) et `tailwindcss` (4+) sont des `peerDependencies`, jamais des dépendances.

## Classes des composants

Convention de Nuxt UI :

- Chaque composant a un thème : ses slots (les éléments internes : `base`, `label`, `leadingIcon`…) et ses variantes (`size`, `pill`, `disabled`…), avec les classes de chaque cas. Il reprend les dictionnaires de classes (`{% set %}`) de la macro du template.
- Noms des slots : `base` pour l'élément principal (`<button>`, `<input>`), `root` pour le conteneur extérieur quand le composant en a un. Jamais le nom de la balise, qui peut changer (un Button avec lien devient un `<a>`).
- La prop `ui` personnalise une instance, slot par slot : `<KButton :ui="{ base: 'rounded-none', leadingIcon: 'size-5' }" />`.
- La prop `class` s'applique à la racine.
- Les thèmes s'écrivent avec `tailwind-variants` (`tv()`), comme Nuxt UI : slots, variantes, combinaisons de variantes et valeurs par défaut dans un seul objet. Les types des props de variante (`size`, `color`…) en sont déduits, jamais écrits à la main.
- Ce qui est passé en props l'emporte toujours : les classes de `ui` ou `class` remplacent les classes par défaut équivalentes (`rounded-none` remplace `rounded-full`), au lieu de s'y ajouter. La fusion passe par le moteur intégré à `tailwind-variants` (les règles de `tailwind-merge`, sans package séparé). Les thèmes importent `tv` depuis `shared/utils/tv.ts`, jamais directement : c'est là qu'on déclarera les tokens d'espacement maison (`p-page-gutter`…), via `tailwind-variants/config`, quand un composant les utilisera.
- Pas de personnalisation globale pour l'instant, seulement `ui` et `class`. Les thèmes restent des objets `tv()` séparés des composants, pour pouvoir ajouter plus tard le niveau global (`app.config.ts` en Nuxt, options du plugin en Vue) sans changement cassant.

## Thèmes

- `data-theme="light"` ou `"dark"` sur `<html>`, posé par le projet qui utilise la librairie. `src/index.css` en déduit `color-scheme`.
- Couleurs de marque et de surface : tokens `--color-*` dans `theme.css`, déclarés avec `light-dark(<clair>, <sombre>)`, dont la classe s'écrit sans variante (`ring-primary`, `bg-canvas` pour le fond de page, `bg-widget` pour les cartes, `border-line` pour les bordures et séparateurs). Toute autre couleur vient de la palette Tailwind et s'écrit en paire `light:…` + `dark:…`, jamais sans variante.

## Langue

Tout est en anglais : code, commentaires, textes, README, fichiers de config. Seule exception : ce fichier CLAUDE.md.

## Principes

Clean code, KISS, DRY, SOLID. Le code se lit sans commentaire : ce sont les noms qui l'expliquent.

## Nommage

Chaque nom doit être significatif : on doit comprendre à quoi il sert au premier coup d'œil, sans lire le code autour.

S'applique à tout : variables CSS et tokens `@theme`, props, events, variables et fonctions, classes, IDs, noms de fichiers.

- Variables : orientées domaine, elles disent ce qu'elles représentent pour Kuina (`buttonSize`, `selectedOption`, `leadingIcon`), pas leur nature technique.
- Fonctions et méthodes : un verbe qui décrit l'action, suivi de ce sur quoi elle agit (`mergeSlotClasses`, `focusNextOption`, `resolveButtonTag`).
- Interdit : noms génériques ou abrégés comme `x`, `data`, `item`, `val`, `tmp`, `el`, `obj`, `info`.
- Un nom précise son rôle et son périmètre. Exemple : `--spacing-page-gutter` (l'espacement autour de la page) plutôt que `--spacing-gutter` (gutter de quoi ?).
- Mieux vaut un nom un peu long et clair qu'un nom court et ambigu.

## Commits

Messages au format Conventional Commits (`feat: …`, `fix: …`, `chore: …`), en anglais, vérifiés par commitlint.

## Commentaires

Tant qu'il n'y a rien à expliquer, on ne commente pas.

- Seul endroit autorisé : un doc block (`/** … */`) au-dessus d'une fonction ou d'une classe, et seulement si son nom ne suffit pas.
- Court, à la manière de Laravel : une phrase qui dit ce que fait la fonction, par exemple `/** Merge the user classes into the theme slots. */`.
- Styles : pas de doc block au-dessus des `@utility` et `@custom-variant`, sauf si leur comportement est vraiment impossible à deviner.
- Partout ailleurs, templates Vue et fichiers de config compris : aucun commentaire. Un commentaire qui répète le code est inutile.
