# Draftr plugin

Connects your coding agent to [Draftr](https://draftr.top), a structured UI design editor. The agent can read your designs, build screens from components and starter blocks, answer comments, wire prototypes and export finished work, while people in the file see it in presence.

The plugin holds no code that runs on your machine. It adds two things:

- the Draftr MCP server at `https://app.draftr.top/mcp`, reached over Streamable HTTP;
- the `design` skill, which tells the agent how to work with Draftr documents safely.

## Before you install

You need a Draftr account with a verified email at [app.draftr.top](https://app.draftr.top). You sign in through your browser and approve what the agent may do. It acts within your own document permissions, and you can disconnect it under **Account settings**, **Agent access tokens**.

## Claude Code

```bash
claude plugin marketplace add Draftr-Solutions/draftr-plugin
```

```bash
claude plugin install draftr@draftr
```

Then open Claude Code, run `/mcp`, choose `draftr` and sign in. Ask for your Draftr designs, or run `/draftr:design`.

## Codex

```bash
codex plugin marketplace add Draftr-Solutions/draftr-plugin
```

```bash
codex plugin add draftr@draftr
```

```bash
codex mcp login draftr
```

This opens your browser; in the desktop app, select **Authenticate**. Check the connection with `codex mcp list`, restart Codex and ask for your Draftr designs. Draftr marks `apply_commands` as destructive, so Codex needs your approval to edit a design: `codex exec` cannot ask and cancels those calls, so edit from an interactive session.

## What leaves your machine

Tool calls, with the design content and uploaded files they carry, go to `app.draftr.top` together with an access token. The plugin sends nothing anywhere else and has no hooks or scripts. Draftr records which tools an agent calls, as its [privacy policy](https://draftr.top/privacy) describes. See also the [terms](https://draftr.top/terms).

## Troubleshooting

- **The Draftr tools are missing, or 401 Unauthorized:** you are not signed in, or you disconnected the agent. Sign in again with `/mcp` in Claude Code or `codex mcp login draftr` in Codex.
- **403 INSUFFICIENT_SCOPE:** this connection is read-only. Connect again and allow editing.
- **A personal token instead of OAuth:** create one under **Agent access tokens** and add the server yourself with an `Authorization: Bearer` header.

Support: [support@draftr.top](mailto:support@draftr.top).
