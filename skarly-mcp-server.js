const path = require('path');
const SDK_PATH = path.join(__dirname, 'node_modules', '@modelcontextprotocol', 'sdk', 'dist', 'cjs', 'server');
const { McpServer } = require(path.join(SDK_PATH, 'mcp.js'));
const { StdioServerTransport } = require(path.join(SDK_PATH, 'stdio.js'));
const { z } = require('zod');
const fs = require('fs');

const WORKSPACE = '/home/henry/.openclaw/workspace-skarly';

// Create MCP server
const server = new McpServer(
  { name: 'skarly-godot', version: '1.0.0' },
  {}
);

// ─────────────────────────────────────────────
// Helper: Walk directory and find all files
// ─────────────────────────────────────────────
function walkDir(dir) {
  const files = [];
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...walkDir(full));
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.txt'))) {
        files.push(full);
      }
    }
  } catch (e) {
    // Ignore permission errors
  }
  return files;
}

// ─────────────────────────────────────────────
// Helper: Search files for a keyword
// ─────────────────────────────────────────────
function grep(dir, query) {
  const results = [];
  for (const file of walkDir(dir)) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          results.push(`${file}:${i + 1}: ${line.trim()}`);
        }
      });
    } catch (e) {
      // Ignore read errors
    }
  }
  return results;
}

// ─────────────────────────────────────────────
// Register: List all resources (files)
// ─────────────────────────────────────────────
const files = walkDir(WORKSPACE);
for (const file of files) {
  const uri = `file://${file}`;
  const name = path.relative(WORKSPACE, file);
  
  server.registerResource(
    name,
    uri,
    { title: name },
    async (uri) => {
      const filePath = uri.replace('file://', '');
      const content = fs.readFileSync(filePath, 'utf-8');
      return {
        contents: [{
          uri,
          mimeType: 'text/markdown',
          text: content
        }]
      };
    }
  );
}

// ─────────────────────────────────────────────
// Register: Search tool
// ─────────────────────────────────────────────
server.registerTool(
  'search',
  {
    title: 'Search Workspace',
    description: 'Search all files in Skarly workspace for a keyword or phrase',
    inputSchema: {
      query: z.string()
    }
  },
  async ({ query }) => {
    const results = grep(WORKSPACE, query);
    return {
      content: [{
        type: 'text',
        text: results.length > 0
          ? results.join('\n')
          : `No results found for "${query}"`
      }]
    };
  }
);

// ─────────────────────────────────────────────
// Register: List files tool
// ─────────────────────────────────────────────
server.registerTool(
  'list_files',
  {
    title: 'List Files',
    description: 'List all accessible files in the Skarly workspace',
    inputSchema: {}
  },
  async () => {
    const files = walkDir(WORKSPACE);
    return {
      content: [{
        type: 'text',
        text: files.map(f => `file://${f}`).join('\n')
      }]
    };
  }
);

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
