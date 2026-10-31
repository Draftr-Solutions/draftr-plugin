import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { instructionsPath, renderRules, rulesPath } from '../scripts/sync-rules.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const plugin = join(root, 'plugins/draftr');
const json = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
const claude = json('plugins/draftr/.claude-plugin/plugin.json');
const codex = json('plugins/draftr/.codex-plugin/plugin.json');
const mcpUrl = 'https://app.draftr.top/mcp';

function files(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

test('both clients install the same plugin at the same version', () => {
  assert.equal(claude.name, 'draftr');
  assert.equal(codex.name, claude.name);
  assert.equal(codex.version, claude.version);
  assert.equal(codex.description, claude.description);
  for (const marketplace of [
    json('.claude-plugin/marketplace.json'),
    json('.agents/plugins/marketplace.json'),
  ]) {
    assert.equal(marketplace.name, 'draftr');
    assert.deepEqual(
      marketplace.plugins.map((entry) => entry.name),
      ['draftr'],
    );
  }
});

test('Claude Code keeps the token in a sensitive option', () => {
  const { draftr } = json('plugins/draftr/.mcp.json').mcpServers;
  assert.deepEqual(draftr, {
    type: 'http',
    url: mcpUrl,
    headers: { Authorization: 'Bearer ${user_config.token}' },
  });
  assert.equal(claude.userConfig.token.sensitive, true);
});

test('Codex reads the token from the environment', () => {
  assert.equal(codex.mcpServers, './codex.mcp.json');
  assert.deepEqual(json('plugins/draftr/codex.mcp.json').mcpServers.draftr, {
    type: 'http',
    url: mcpUrl,
    bearer_token_env_var: 'DRAFTR_TOKEN',
  });
});

test('nothing in the plugin carries a token or a local address', () => {
  for (const file of files(plugin).filter((path) => /\.(json|md)$/.test(path))) {
    const text = readFileSync(file, 'utf8');
    const name = relative(root, file);
    assert.doesNotMatch(text, /Bearer (?!\$\{user_config\.token\})[A-Za-z0-9_-]{8,}/, name);
    assert.doesNotMatch(text, /127\.0\.0\.1|localhost/, name);
  }
});

test('the directory limits hold for every plugin file', () => {
  const all = files(plugin);
  assert.ok(all.length <= 512);
  for (const file of all.filter((path) => !path.endsWith('.png')))
    assert.ok(statSync(file).size < 256 * 1024, relative(root, file));
});

test('the skill names itself and links its rules', () => {
  const skill = readFileSync(join(plugin, 'skills/design/SKILL.md'), 'utf8');
  assert.match(skill, /^---\nname: design\ndescription: .{50,}\n---\n/);
  assert.match(skill, /\(references\/editing-rules\.md\)/);
});

test('the editing rules match the MCP server when the backend is checked out', (context) => {
  if (!existsSync(instructionsPath)) return context.skip('backend is not next to this repository');
  assert.equal(
    readFileSync(rulesPath, 'utf8'),
    renderRules(readFileSync(instructionsPath, 'utf8')),
    'Run pnpm sync:rules.',
  );
});
