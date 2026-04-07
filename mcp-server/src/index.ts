import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { executeSearch } from './tools/search.js';
import { executeLog } from './tools/log.js';
import { executeRecordDecision } from './tools/record-decision.js';
import { executeCheckArchitecture } from './tools/check-architecture.js';
import { executeGetWorkflow } from './tools/get-workflow.js';
import { executeIngest } from './tools/ingest.js';
import { executeQuery } from './tools/query.js';
import { executeLint } from './tools/lint.js';

const VAULT_PATH = process.env.VAULT_PATH || `${process.env.HOME}/Obsidian/VibeCoding`;

const server = new McpServer({
  name: 'vibe-knowledge-base',
  version: '1.0.0',
});

server.tool(
  'kb_search',
  'Search the knowledge base wiki by keyword or topic',
  { query: z.string().describe('Search query') },
  async ({ query }) => {
    const result = await executeSearch(VAULT_PATH, query);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'kb_log',
  'Append an entry to the operations log',
  {
    operation: z.string().describe('Operation type (ingest, query, lint, decision)'),
    details: z.string().describe('Details of the operation'),
  },
  async ({ operation, details }) => {
    const result = await executeLog(VAULT_PATH, operation, details);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

server.tool(
  'kb_record_decision',
  'Record an Architecture Decision Record (ADR)',
  {
    title: z.string().describe('Decision title'),
    context: z.string().describe('What is the issue? What forces are at play?'),
    decision: z.string().describe('What was decided and why?'),
    consequences: z.string().describe('Positive and negative consequences'),
  },
  async (input) => {
    const result = await executeRecordDecision(VAULT_PATH, input);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

server.tool(
  'kb_check_architecture',
  'Check a proposed approach against wiki architecture patterns and ADRs',
  { proposal: z.string().describe('Description of the proposed architectural approach') },
  async ({ proposal }) => {
    const result = await executeCheckArchitecture(VAULT_PATH, proposal);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'kb_get_workflow',
  'Get a workflow template (feature, bugfix, or ingest)',
  { type: z.enum(['feature', 'bugfix', 'ingest']).describe('Workflow type') },
  async ({ type }) => {
    const result = await executeGetWorkflow(VAULT_PATH, type);
    return { content: [{ type: 'text' as const, text: result }] };
  }
);

server.tool(
  'kb_ingest',
  'Read a raw source file and return its content with wiki context for processing',
  { source_path: z.string().describe('Path to source file relative to vault root (e.g., raw/articles/react-best-practices.md)') },
  async ({ source_path }) => {
    const result = await executeIngest(VAULT_PATH, source_path);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'kb_query',
  'Query the knowledge base — returns relevant wiki pages for synthesis',
  { question: z.string().describe('The question to answer from the wiki') },
  async ({ question }) => {
    const result = await executeQuery(VAULT_PATH, question);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
);

server.tool(
  'kb_lint',
  'Run health checks on the wiki: broken links, orphan pages, contradictions',
  { scope: z.string().optional().describe('Optional subdirectory to scope the lint (e.g., "architecture")') },
  async ({ scope }) => {
    const result = await executeLint(VAULT_PATH, scope);
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
