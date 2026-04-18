# Godot MCP Setup — For VI.V

## The Problem
mcporter spawns a NEW godot-mcp-pro server process per tool call. Each new process creates its own WebSocket server on port 6505. But Godot MCP Pro plugin already has ONE persistent connection to ONE server process. mcporter's new processes don't share that connection — so all tool calls fail with "editor not connected."

## What Works
- godot-cli at /home/henry/mcp/godot-mcp-pro/server/build/cli.js creates its OWN temporary server and connects to Godot directly — this WORKS
- Direct file read/write

## What Doesn't Work
- mcporter call godot.* — always fails with "editor not connected"
- mcporter daemon mode — says "No MCP servers configured for keep-alive" even with keepAlive: true

## The Fix Needed
A PERSISTENT server daemon that:
1. Starts ONE godot-mcp-pro server process and keeps it running
2. Listens on port 6505 where Godot connects
3. All mcporter calls route through that one persistent process

## Setup Info
- Godot MCP Pro server: /home/henry/mcp/godot-mcp-pro/server/build/index.js
- Godot editor: /home/henry/.local/bin/godot v4.6.2
- Project: /home/henry/manga-maker/
- Primary MCP port: 6505

## Possible Solutions
1. Set up a systemd/user service that runs the godot-mcp-pro server persistently
2. Or fix mcporter daemon to properly keep the server alive
3. Or use a different MCP client that supports persistent WebSocket connections
