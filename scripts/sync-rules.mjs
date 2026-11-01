import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const rulesPath = fileURLToPath(
  new URL('../plugins/draftr/skills/design/references/editing-rules.md', import.meta.url),
);
export const instructionsPath = fileURLToPath(
  new URL('../../backend/src/mcp/tools/mcp.instructions.ts', import.meta.url),
);

/** The rules agents get from the server, one bullet per rule, without internal decision numbers. */
export function renderRules(source) {
  const rules = [...source.matchAll(/^ {2}'(.*)',$/gm)].map((match) =>
    match[1].replaceAll("\\'", "'").replaceAll(/ \(D\d+(?:, D\d+)*\)/g, ''),
  );
  if (!rules.length) throw new Error('No rules found in the MCP instructions.');
  return [
    '# Draftr editing rules',
    '',
    'Generated from the instructions of the Draftr MCP server by `pnpm sync:rules`. Do not edit.',
    '',
    ...rules.map((rule) => `- ${rule}`),
    '',
  ].join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await writeFile(rulesPath, renderRules(await readFile(instructionsPath, 'utf8')));
  console.log('Editing rules updated.');
}
