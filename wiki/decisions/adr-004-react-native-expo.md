# ADR-004: React Native + Expo over Flutter or Native

**Date:** 2026-04-09
**Status:** Accepted
**Source project:** Cairn (reference)

## Context

Cairn is primarily a mobile app (location-based, camera access, map interaction) with potential for a web companion view.

## Options considered

- **Native (Swift + Kotlin):** Best performance, full platform API access. But two codebases, two languages, double the maintenance for a solo developer.
- **Flutter:** Single codebase, good performance, mature. But Dart is a language with a smaller ecosystem than JavaScript/TypeScript, and the web output is not true web (renders to canvas).
- **React Native + Expo:** Single codebase in TypeScript, massive ecosystem, Expo handles build/deploy/OTA updates. Expo Router provides file-based routing. Expo Web gives a real web output when needed.

## Decision

React Native + Expo.

## Reasoning

TypeScript is the language I know best and that my coding agents work best with. Expo eliminates the need to touch Xcode or Android Studio for an MVP — builds happen in the cloud via EAS. The ecosystem overlap with web (React, npm, TanStack Query, Zustand) means patterns and skills transfer. Expo's managed workflow means no ejecting, no native module pain.

## Tradeoffs accepted

React Native performance is slightly worse than native for animation-heavy UIs (mitigated by Reanimated). Some native APIs require Expo modules that may lag behind native SDK releases. Expo's managed workflow limits access to some advanced native configurations.

## Related

- [[stacks/mobile]]
- [[patterns/file-structure]] — Canonical Expo layout
