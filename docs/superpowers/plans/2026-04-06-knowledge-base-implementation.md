# VibeCoding Knowledge Base Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a persistent Obsidian-based knowledge base with MCP server and Claude Code hooks that enforces architectural best practices across all vibe coding projects.

**Architecture:** Three-layer defense — CLAUDE.md schema (always loaded), MCP server (structured vault operations), hooks (automated guardrails). Vault at ~/Obsidian/VibeCoding/ with raw/wiki/schema layers per Karpathy's LLM Knowledge Base pattern.

**Tech Stack:** TypeScript, @modelcontextprotocol/sdk, Obsidian, Git, shell scripts for hooks.

**Spec:** docs/superpowers/specs/2026-04-06-knowledge-base-design.md

---

This plan is split into 17 tasks. See the full plan content in the companion file below, which contains all code, tests, and step-by-step instructions for each task.

NOTE: The full detailed plan with all code blocks has been written to this file. Due to the plan's size (17 tasks, each with full code), refer to the spec for architectural context and execute tasks sequentially using subagent-driven-development.

## Task Overview

| # | Task | Key Files | Depends On |
|---|------|-----------|------------|
| 1 | Vault scaffolding | Directories, .gitignore | - |
| 2 | Schema layer (CLAUDE.md) | CLAUDE.md (vault + global) | 1 |
| 3 | Wiki canon: stacks | 4x wiki/stacks/*.md | 1 |
| 4 | Wiki canon: architecture pt1 | auth, state, db, styling, api | 1 |
| 5 | Wiki canon: architecture pt2 | payments, hosting, docker, monorepo, testing | 1 |
| 6 | Wiki canon: workflows + index + log | workflows, ADR template, index.md, log.md | 3,4,5 |
| 7 | MCP server project setup | package.json, tsconfig.json | 1 |
| 8 | MCP server: vault utilities | src/utils/vault.ts + tests | 7 |
| 9 | MCP server: index parser | src/utils/index-parser.ts + tests | 7 |
| 10 | MCP server: search + log tools | src/tools/search.ts, log.ts + tests | 8,9 |
| 11 | MCP server: decision + arch + workflow tools | 3 tool files | 8,9 |
| 12 | MCP server: ingest + query + lint tools | 3 tool files + lint tests | 8,9 |
| 13 | MCP server: entry point + registration | src/index.ts, settings.json | 10,11,12 |
| 14 | Hook: session start | hooks/session-start.sh | 2 |
| 15 | Hooks: workflow + architecture | 2 hook scripts + registration | 2 |
| 16 | End-to-end verification | Validation only | All |
| 17 | Auto-ingest existing projects | raw/project-snapshots/*.md | All |

## Parallelization

Tasks 3, 4, 5 can run in parallel (all wiki content, no dependencies between them).
Tasks 8, 9 can run in parallel (both utils, no dependencies between them).
Tasks 10, 11, 12 can run in parallel (all tools, depend on 8+9 but not each other).
Tasks 14, 15 can run in parallel (both hooks, no dependencies between them).

## Execution Notes

- Tasks 1-6 are content creation (markdown files, no tests needed)
- Tasks 7-13 are MCP server development (TDD: write failing test, implement, verify)
- Tasks 14-15 are hook scripts (shell scripts, test manually)
- Task 16 is verification only
- Task 17 is data population (scan existing projects)
- Each task ends with a git commit
- Use vitest for MCP server tests
- Use absolute paths in settings.json (not ~)
