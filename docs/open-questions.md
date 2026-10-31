# Open questions and design smells

From exploratory testing on 2026-10-31. Unverified, based on a partial read of the code.

## Questions

1. Is `$activeProject` (or `$hoveredProject`) ever cleared? `app/stores/ui.ts` gives `$activeProject` priority over hover after a click. If nothing resets it, Flirt stays activated after leaving `/projects`.
2. Is the 1.1 MB `MediaRenderer` client chunk intended? Likely Mux player and/or three/drei, loaded on Home. Can it be lazy-loaded?
3. Is `useCdn: true` on the Sanity client deliberate? Edits can lag, and there is no draft preview or Visual Editing.
4. What should an unknown URL log? `/nope` logs `No route matches URL` as an error in the dev server.
5. Is the ABC Otto trial font licensed for production? The files are `-Trial.otf` and are served from `public/fonts`.

## Design smells

- `MediaGrid` declares `grid` as required but guards it with `grid &&`; the Sanity type says optional. This is the cause of the typecheck error at `app/routes/_layout._index.tsx:56`.
- `stores/ui.ts` and `lib/mux.ts` import `ProjectInfo` from a route file. Move shared types to a neutral module.
- The layout's mousemove handler reads `$hoveredEl` (a live DOM node) from a store, and `Cover` measures `$flirtEl` at exit. Components are coupled to each other's timing and DOM structure.
- The `grid[_type == "mediaGridBlock"] {…}` projection is duplicated in `app/lib/queries.ts` (lines ~59 and ~105).
- `urlFor(source: any)` in `app/lib/sanity.ts` is loosely typed.
- `wrangler.jsonc` still has the template var `VALUE_FROM_CLOUDFLARE`.
- `README.md` is still the stock React Router template.
- `.claude/skills` and `.agents/skills` are two trees joined by symlinks (see below).
