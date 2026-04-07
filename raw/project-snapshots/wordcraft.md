# Project Snapshot: WordCraft

**Source:** ~/Desktop/Vibes/WordCraft/
**Date:** 2026-04-06
**Type:** 3D phonics learning game (kids educational)

## Stack
- Vanilla JavaScript (no framework)
- Three.js 0.160 (3D rendering)
- Vite 5.4 (dev server + bundler)
- simplex-noise 4.0 (terrain generation)
- Cloudflare Workers (Pages Functions) + D1 SQLite (backend)
- Wrangler CLI (Cloudflare tooling)
- JWT-based auth (custom implementation)
- Vitest 3.2 + jsdom (testing -- 124 tests across 7 files)
- Also has a standalone Express-like server/ directory (Docker-deployable alternative)

## Architecture
```
src/                          # Frontend (vanilla JS)
  main.js                    # Entry point, boot sequence
  world.js                   # Three.js 3D world
  monsters.js                # Monster spawning & AI
  phonics.js                 # Phonics challenge engine
  hud.js                     # HUD overlay (hearts, streak, challenges)
  leaderboard.js             # Leaderboard overlay
  api.js                     # API client with JWT auth
  auth-ui.js                 # Login/register/guest UI
  state.js                   # Game state + event emitter
  curriculum.js              # Phonics curriculum data
  audio.js                   # Text-to-speech
  terrain.js                 # Procedural terrain (simplex noise)
  sword.js                   # Sword/combat mechanic
functions/api/               # Backend (Cloudflare Workers)
  _lib/auth.js, jwt.js       # Auth utilities
  _middleware.js              # Request middleware
  auth/login.js, register.js, me.js  # Auth endpoints
  scores/index.js, top.js    # Score submission + leaderboard
  progress.js                # User progress tracking
  health.js
server/                      # Alternative backend (Express/Node)
  server.js, db.js, Dockerfile
  routes/health.js, progress.js, scores.js
tests/unit/                  # 20+ test files covering all modules
schema.sql                   # D1 database schema
wrangler.toml                # Cloudflare config
index.html                   # SPA entry
```

## Patterns Observed
- No framework -- pure vanilla JS with module imports, event emitter for state management
- Three.js for full 3D game world (WASD movement, mouse look, jumping)
- Two challenge modes: "Read" (see phoneme, speak into mic) and "Listen" (hear phoneme, type answer)
- Speech recognition (Web Speech API) for voice-based answers
- Procedural terrain via simplex noise
- Monster AI with approach/attack patterns; trees as hiding spots
- Streak system with milestone celebrations every 5 correct; boss spawns every 3rd correct
- Three-lives system (three wrong answers = game over)
- Dual backend: Cloudflare Workers (production) + standalone Express server (Docker alternative)
- Guest mode with localStorage fallback for progress; full auth for leaderboard
- Custom JWT implementation (no auth library)
- Extensive test coverage: every source module has a corresponding test file

## Lessons / Decisions
- Chose vanilla JS over React/framework for a game -- avoids virtual DOM overhead in render loop
- Three.js directly managed rather than through R3F -- tighter control for game mechanics
- Cloudflare Workers + D1 for serverless edge deployment; Express server as Docker fallback
- Custom JWT auth rather than auth-as-a-service -- keeps the stack simple and self-contained
- Phonics curriculum embedded in code (curriculum.js) rather than fetched from API
- Web Speech API for voice input -- browser-native, no third-party speech service
- AGENT_COORDINATION.md present -- suggests multi-agent development workflow was used
