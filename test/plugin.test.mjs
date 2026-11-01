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

test('Claude Code signs in with OAuth and holds no token', () => {
  const { draftr } = json('plugins/draftr/.mcp.json').mcpServers;
  // An Authorization header would stop Claude Code from falling back to OAuth.
  assert.deepEqual(draftr, { type: 'http', url: mcpUrl });
  assert.equal(claude.userConfig, undefined);
});

test('Codex signs in with OAuth and holds no token', () => {
  assert.equal(codex.mcpServers, './codex.mcp.json');
  assert.deepEqual(json('plugins/draftr/codex.mcp.json').mcpServers.draftr, {
    type: 'http',
    url: mcpUrl,
  });
});

test('the OpenAI listing declares OAuth without credentials', () => {
  assert.deepEqual(json('plugins/draftr/mcp.json').mcpServers.draftr, {
    type: 'streamable-http',
    url: mcpUrl,
    extensions: { 'com.openai': { auth: { type: 'oauth', client: { mode: 'cimd' } } } },
  });
});

test('the OpenAI listing fits the portal limits', () => {
  const listing = json('listing/openai.plugin.json');
  const openai = listing.extensions['com.openai'];
  assert.equal(listing.version, claude.version);
  assert.equal(listing.name, 'draftr');
  assert.ok(openai.interface.displayName.length <= 30);
  assert.ok(openai.interface.shortDescription.length <= 30);
  assert.ok(openai.interface.longDescription.length <= 4000);
  assert.ok(codex.interface.shortDescription.length <= 30);
  for (const url of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL'])
    assert.match(openai.interface[url], /^https:\/\//);
  assert.ok(openai.interface.defaultPrompt.every((prompt) => prompt.length <= 128));
  assert.equal(openai.review.test_cases.positive.length, 5);
  assert.equal(openai.review.test_cases.negative.length, 3);
  for (const test of openai.review.test_cases.positive)
    assert.ok(test.tools_triggered.length && test.expected_behavior);
});

test('nothing in the plugin carries a token or a local address', () => {
  for (const file of files(plugin).filter((path) => /\.(json|md)$/.test(path))) {
    const text = readFileSync(file, 'utf8');
    const name = relative(root, file);
    assert.doesNotMatch(text, /Bearer [A-Za-z0-9_-]{8,}/, name);
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
  assert.match(skill, /^## Ask the user$/m);
});

test('the editing rules match the MCP server when the backend is checked out', (context) => {
  if (!existsSync(instructionsPath)) return context.skip('backend is not next to this repository');
  assert.equal(
    readFileSync(rulesPath, 'utf8'),
    renderRules(readFileSync(instructionsPath, 'utf8')),
    'Run pnpm sync:rules.',
  );
});
