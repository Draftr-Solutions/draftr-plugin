# Draftr plugin

The Draftr plugin for Claude Code and Codex, and a plugin marketplace for both. Installation and usage are in [plugins/draftr/README.md](plugins/draftr/README.md).

```text
.claude-plugin/marketplace.json     Claude Code marketplace
.agents/plugins/marketplace.json    Codex marketplace
plugins/draftr/                     the plugin, the only folder users receive
  .claude-plugin/plugin.json        Claude Code manifest
  .mcp.json                         MCP server for Claude Code
  .codex-plugin/plugin.json         Codex manifest
  codex.mcp.json                    MCP server for Codex
  mcp.json                          MCP server with OAuth, for the OpenAI listing
  skills/design/                    shared skill and generated editing rules
scripts/, test/                     checks, never installed
```

Development rules are in [CONTRIBUTING.md](CONTRIBUTING.md).
