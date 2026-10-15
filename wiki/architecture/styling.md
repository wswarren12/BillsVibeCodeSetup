# Styling

## Decision Tree
- Web? → Tailwind CSS + shadcn/ui
- Mobile (Expo)? → NativeWind
- Need a component? → Check shadcn/ui first before building custom
- Custom design system? → Extend the shadcn theme (CSS variables + Tailwind config)
- Email templates? → React Email + Tailwind

## Why
- Tailwind utility-first approach gives great DX, small bundles, and no naming debates
- shadcn/ui gives you copy-paste components you own, built on Radix primitives (accessible by default)
- NativeWind brings the same Tailwind mental model to React Native
- React Email + Tailwind makes email templates feel like normal React development

## Anti-patterns
- No CSS Modules — fragmenting styles across files for no benefit
- No styled-components / Emotion — runtime CSS-in-JS is dead (performance cost, SSR pain)
- No MUI / Chakra — heavy bundles, opinionated styling you'll fight against, hard to customize

## Gotchas in existing codebases

### styled-jsx selectors can miss DOM rendered through Next Link
- **Symptom:** PLAA footer links inherited dark body text despite a teal `.pf__link` rule (2026-09-30).
- **Cause:** styled-jsx emitted `.pf__link.jsx-…`, but mapped Next `Link` elements rendered with only `class="pf__link"`. The scoped footer parent retained its generated class.
- **Resolution:** use `.pf :global(.pf__link)` and `.pf :global(.pf__link:hover)` to scope through the native parent instead. Desktop/mobile computed-style checks verified the requested color.
- **Prevention:** in existing styled-jsx code, inspect emitted selectors and DOM classes across component boundaries; verify computed color rather than trusting the source declaration. Keep global child selectors anchored to a scoped parent.

## Sources
[To be populated via ingest]
