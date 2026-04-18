---
name: claude-wiki
description: Provides read/write access to the Claude Wiki inside the shared Obsidian vault, with format validation.
---

# claude-wiki

This skill wraps `mcporter` calls to manage pages in the Claude Wiki (`~/Qsync/Obsidian/viv/ClaudeWiki/wiki`).

## Actions

- `wiki.read page=filename.md` – reads a page.
- `wiki.write page=filename.md content="..."` – validates against the LLM Wiki template, lints, then writes.
- `wiki.list` – lists all markdown pages in the wiki folder.

## Validation

Before any write, the skill runs the built‑in lint routine (see the LLM Wiki spec) and aborts with a list of required fixes if the content does not match the required structure.
