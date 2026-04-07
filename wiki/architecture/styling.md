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

## Sources
[To be populated via ingest]
