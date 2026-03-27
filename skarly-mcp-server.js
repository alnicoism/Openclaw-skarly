const { Server } = require('@modelcontextprotocol/server');
const { StdioServerTransport } = require('@modelcontextprotocol/server/stdio');
const fs = require('fs');
const path = require('path');

const WORKSPACE = '/home/henry/.openclaw/workspace-skarly';

// Create MCP server
const server = new Server({
  name: 'skarly-godot',
  version: '1.0.0',
}, {
  capabilities: {
    resources: {},   // Allow reading files
    tools: {}        // Allow searching
  }
});

// ─────────────────────────────────────────────
// HANDLER: List all files in the workspace
// ─────────────────────────────────────────────
// Kilo Code calls this to see what files exist
server.setRequestHandler('resources/list', async () => {
  const files = walkDir(WORKSPACE);
  return {
    resources: files.map(filePath => ({
      uri: `file://${filePath}`,
      name: path.relative(WORKSPACE, filePath),
      mimeType: getMimeType(filePath)
    }))
  };
});

// ─────────────────────────────────────────────
// HANDLER: Read a specific file
// ─────────────────────────────────────────────
// Kilo Code calls this when you ask to read a file
server.setRequestHandler('resources/read', async ({ uri }) => {
  const filePath = uri.replace('file://', '');
  const content = fs.readFileSync(filePath, 'utf-8');
  return {
    contents: [{
      uri,
      mimeType: getMimeType(filePath),
      text: content
    }]
  };
});

// ─────────────────────────────────────────────
// HANDLER: List available tools
// ─────────────────────────────────────────────
// Kilo Code calls this to know what tools exist
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [{
      name: 'search',
      description: 'Search all files in Skarly workspace for a keyword',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Keyword or phrase to search for'
          }
        },
        required: ['query']
      }
    }]
  };
});

// ─────────────────────────────────────────────
// HANDLER: Execute a tool
// ─────────────────────────────────────────────
// Kilo Code calls this when you use the search tool
server.setRequestHandler('tools/call', async ({ name, arguments: args }) => {
  if (name === 'search') {
    const results = grep(WORKSPACE, args.query);
    return {
      content: [{
        type: 'text',
        text: results.length > 0
          ? results.join('\n')
          : `No results found for "${args.query}"`
      }]
    };
  }
});

// ─────────────────────────────────────────────
// HELPER: Walk directory and find all .md files
// ─────────────────────────────────────────────
function walkDir(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(full));
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.txt')) {
      files.push(full);
    }
  }
  return files;
}

// ─────────────────────────────────────────────
// HELPER: Search files for a keyword
// ─────────────────────────────────────────────
function grep(dir, query) {
  const results = [];
  for (const file of walkDir(dir)) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      if (line.toLowerCase().includes(query.toLowerCase())) {
        results.push(`${file}:${i+1}: ${line.trim()}`);
      }
    });
  }
  return results;
}

// ─────────────────────────────────────────────
// HELPER: Guess mime type from extension
// ─────────────────────────────────────────────
function getMimeType(filePath) {
  const ext = path.extname(filePath);
  const types = {
    '.md': 'text/markdown',
    '.txt': 'text/plain',
    '.json': 'application/json',
    '.js': 'text/javascript'
  };
  return types[ext] || 'text/plain';
}

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
// StdioServerTransport = communication via stdin/stdout
// This is what lets Kilo Code talk to this script
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
