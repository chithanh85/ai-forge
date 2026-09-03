# Historical Lesson — Template Initialized

**Date:** 2026-05-20
**Type:** historical lesson
**Tags:** #setup #template

> Archive record from the pre-v4.1 template. For current setup, read `docs/GETTING_STARTED.md` and `docs/ARCHITECTURE.md`.

## Summary

The project was initialized as an early AI-assisted development template with shared agent/workflow/skill assets and repository intelligence/memory experiments.

## Why it still matters

This initial structure established the `.agent/`, `.planning/`, workflow and skill conventions that later evolved into AWF.

## Superseded assumptions

The early template used more shared client-specific configuration and machine/tool assumptions. AWF v4.1 replaced that distribution model with:

- `.awf/policy/core.md` as canonical client-neutral policy;
- `.awf/manifest.json` as project-local configuration;
- thin generated client adapters;
- detected toolchain commands;
- optional integration capability boundaries.
